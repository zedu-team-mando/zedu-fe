#!/usr/bin/env bash
# Trusted half of FE PR previews. Never runs PR code; the build artifact is only ever loaded as an image.
#
#   fe-preview.sh deploy <head-sha> <image.tar.gz|-> [built-host]   after a build: gate, push, deploy, statuses
#   fe-preview.sh queued <pr>                          on a PR event: Preview=pending "building", or "no preview"
#   fe-preview.sh watch <deployment-uuid>              wait for Coolify; prints result= to GITHUB_OUTPUT
#   fe-preview.sh settle <pr> <sha> <deployment> <result>  set Preview, only if that deployment is current
#   fe-preview.sh close <pr>                           PR closed: delete preview and image tags
#   fe-preview.sh sweep                                expire idle previews, start queued ones
#   fe-preview.sh prnum <sha>                          print the open PR whose head is <sha>, for per-PR locks
#
# Locks are per PR (GitHub keeps only one waiting job per concurrency group and cancels older
# ones, so a global lock dropped deploys). The cap is therefore approximate under simultaneous deploys.
#
# Env: REPO, GH_TOKEN, COOLIFY_URL (https only), COOLIFY_TOKEN, COOLIFY_PREVIEW_APP,
#      PREVIEW_CAP (30), PREVIEW_TTL_HOURS (48), DRY_RUN=1 (no Coolify, GHCR or GitHub writes).
# Config: preview/zedu-fe.env and preview/zedu-fe-orgs on zedu-ci main, read live like teams.yml.
# A failed read stops the script (fail closed); the next sweep retries.
#
# The build artifact's meta.json is written next to PR code, so nothing here trusts it: the PR,
# gate and backend are recomputed from the GitHub API and the zedu-ci main config.
# State: one bot comment per PR, edited in place:
#   <!-- fe-preview state=active|queued|expired|evicted|removed|error|skipped sha= tag= host= dep= at= -->
# `at` is the expiry baseline: when this commit last became active or queued (a push, or a
# revival by the `preview` label). Rewrites while it stays active or queued (settle, sweep,
# body-edit redeploys) keep it, so TTL and eviction don't drift.
# A preview only leaves `active` once Coolify confirms the delete, so a failed delete is retried.
set -euo pipefail

: "${REPO:?}" "${COOLIFY_PREVIEW_APP:?}"
CAP=${PREVIEW_CAP:-30}
TTL_H=${PREVIEW_TTL_HOURS:-48}
NOW=$(date +%s)
MARK="<!-- fe-preview"
CI_REPO=${CI_REPO:-zedu-hng/zedu-ci}
CFG=$(mktemp); ORGS=$(mktemp)
trap 'rm -f "$CFG" "$ORGS"' EXIT
for f in "zedu-fe.env:$CFG" "zedu-fe-orgs:$ORGS"; do
  gh api -H "Accept: application/vnd.github.raw" "repos/$CI_REPO/contents/preview/${f%%:*}?ref=main" > "${f##*:}" \
    || { echo "::error::Couldn't read preview/${f%%:*} from $CI_REPO main."; exit 1; }
done
cfg() { sed -n "s/^$1=//p" "$CFG" | head -1; }
DOMAIN=$(cfg PREVIEW_DOMAIN)
DEFAULT_HOST=$(cfg PREVIEW_BACKEND_HOST)
OWNER=$(tr '[:upper:]' '[:lower:]' <<< "${REPO%%/*}")
IMAGE="ghcr.io/$OWNER/zedu-fe-preview"
dry() { [ -n "${DRY_RUN:-}" ]; }

if ! dry; then
  : "${COOLIFY_URL:?}" "${COOLIFY_TOKEN:?}"
  [[ "$COOLIFY_URL" == https://* ]] || { echo "::error::COOLIFY_URL must be https; refusing to send the token in cleartext."; exit 1; }
fi

coolify() { # method path -> body on stdout; non-2xx fails
  if dry; then echo "  [dry-run] coolify $1 $2" >&2; echo '{"deployments":[{"deployment_uuid":"dry-run"}],"status":"finished"}'; return 0; fi
  curl -fsS -m 60 -X "$1" -H "Authorization: Bearer $COOLIFY_TOKEN" -H "Accept: application/json" "${COOLIFY_URL%/}/api/v1$2"
}

url() { echo "https://$1.$DOMAIN"; }

status() { # sha context state description [target]
  if dry; then echo "  [dry-run] status ${1:0:7} $2=$3: $4" >&2; return 0; fi
  gh api "repos/$REPO/statuses/$1" -f state="$3" -f context="$2" -f description="${4:0:140}" ${5:+-f target_url="$5"} >/dev/null
}

# Prints "<comment id> <state> <sha> <tag> <host> <dep> <at>" ("-" for empty fields), or nothing.
read_state() {
  gh api --paginate "repos/$REPO/issues/$1/comments?per_page=100" \
    | jq -rs --arg m "$MARK" 'flatten | map(select(.user.login == "github-actions[bot]" and (.body | contains($m)))) | last // empty
      | (.body | capture("state=(?<s>[a-z]*) sha=(?<h>[^ ]*) tag=(?<t>[^ ]*) host=(?<o>[^ ]*) dep=(?<d>[^ ]*) at=(?<a>[0-9]*)")) as $c
      | [.id, $c.s, $c.h, $c.t, $c.o, $c.d, $c.a] | map(if . == "" then "-" else tostring end) | join(" ")'
}

write_state() { # pr state sha tag host dep message [comment id]
  local body prev pst psha pat at=$NOW
  prev=$(read_state "$1")
  read -r _ pst psha _ _ _ pat <<< "${prev:-- - - - - - -}"
  # Same commit and still live: keep the baseline. Coming back from expired/evicted resets it.
  [ "$psha" = "${3:--}" ] && [[ "$pst" =~ ^(active|queued)$ ]] && [[ "$pat" =~ ^[0-9]+$ ]] && at=$pat
  body=$(printf '%s state=%s sha=%s tag=%s host=%s dep=%s at=%s -->\n### Preview\n\n%s\n' \
    "$MARK" "$2" "${3#-}" "${4#-}" "${5#-}" "${6#-}" "$at" "$7")
  if dry; then echo "  [dry-run] PR #$1 state=$2: $7" >&2; return 0; fi
  if [ -n "${8:-}" ] && [ "$8" != - ]; then
    gh api -X PATCH "repos/$REPO/issues/comments/$8" -f body="$body" >/dev/null
  else
    gh api "repos/$REPO/issues/$1/comments" -f body="$body" >/dev/null
  fi
  label_sync "$1" "$pst" "$2"
}

# Labels index the PRs that hold a preview slot, so counting and sweeping cost one listing instead of
# a state read per open PR. Adding a missing label creates it.
LIVE=preview-live QUEUED=preview-queued
label_for() { case "$1" in active) echo "$LIVE" ;; queued) echo "$QUEUED" ;; esac; }
label_sync() { # pr old-state new-state; reconciles both labels against what the PR actually has
  local want have l
  want=$(label_for "$3")
  if dry; then echo "  [dry-run] PR #$1 labels -> ${want:-none}" >&2; return 0; fi
  if ! have=$(gh api "repos/$REPO/issues/$1/labels" --jq '.[].name'); then
    echo "::warning::PR #$1: couldn't read labels; preview labels not reconciled."; return 0
  fi
  if [ -n "$want" ] && ! grep -qxF "$want" <<< "$have"; then
    gh api -X POST "repos/$REPO/issues/$1/labels" -f "labels[]=$want" >/dev/null \
      || echo "::warning::PR #$1: couldn't add $want."
  fi
  for l in "$LIVE" "$QUEUED"; do
    if [ "$l" = "$want" ] || ! grep -qxF "$l" <<< "$have"; then continue; fi
    gh api -X DELETE "repos/$REPO/issues/$1/labels/$l" >/dev/null \
      || echo "::warning::PR #$1: couldn't remove $l; it still counts toward the cap."
  done
  return 0
}

# PR numbers carrying a label, open or closed (a closed PR still labelled live holds a container).
labelled() { gh api --paginate "repos/$REPO/issues?state=all&labels=$1&per_page=100" --jq '.[].number'; }

# Normalised Backend URL line of a PR body, unvalidated: "line:<value>", or "none" when absent, so
# removing the line (back to the default backend) counts as a change.
bline() {
  local l
  l=$(printf '%s\n' "$1" | tr -d '\r' | grep -iE '^[[:space:]]*backend url:' | head -1 || true)
  [ -n "$l" ] || { echo none; return 0; }
  echo "line:$(sed -E 's/^[[:space:]]*[Bb][Aa][Cc][Kk][Ee][Nn][Dd] [Uu][Rr][Ll]:[[:space:]]*//; s/[[:space:]`<>]//g; s#/+$##' <<< "$l")"
}

# Backend host from the PR body (trusted API read), or the default. Prints "<host> <override>" or fails.
backend() {
  local body line u
  body=$(gh api "repos/$REPO/pulls/$1" --jq '.body // ""' | tr -d '\r')
  line=$(grep -iE '^[[:space:]]*backend url:' <<< "$body" | head -1 || true)
  [ -n "$line" ] || { echo "$DEFAULT_HOST false"; return 0; }
  u=$(sed -E 's/^[[:space:]]*[Bb][Aa][Cc][Kk][Ee][Nn][Dd] [Uu][Rr][Ll]:[[:space:]]*//; s/[[:space:]`<>]//g; s#/+$##' <<< "$line")
  [[ "$u" =~ ^https://(api\.[a-z0-9-]+\.groups\.zedu\.chat)$ ]] || return 1
  echo "${BASH_REMATCH[1]} true"
}

# Active previews, oldest first: "<at> <pr>". Reads state only for labelled PRs (at most ~CAP).
active_previews() {
  local n
  for n in $(labelled "$LIVE"); do
    read_state "$n" | awk -v n="$n" '$2 == "active" { print $7, n }'
  done | sort -n
}

remove() { # pr new-state message -> 0 when Coolify confirmed the delete
  local id st sha tag host dep at
  read -r id st sha tag host dep at <<< "$(read_state "$1")"
  [ "$st" = active ] || return 0
  if ! coolify DELETE "/applications/$COOLIFY_PREVIEW_APP/previews/$1" >/dev/null; then
    echo "::warning::PR #$1: Coolify didn't delete the preview; it stays active and the next sweep retries."
    return 1
  fi
  write_state "$1" "$2" "$sha" "$tag" "$host" - "~~$(url "$1")~~ $3" "$id"
  [ "$2" = removed ] || status "$sha" Preview success "Stopped: $3" ""
}

gate_of() { # head-repo labels-json -> reviewer|registered|label|skip
  if [ "$1" = "$REPO" ]; then echo reviewer
  elif grep -v '^#' "$ORGS" | grep -qixF "${1%%/*}"; then echo registered
  elif jq -e 'index("preview") != null' <<< "$2" >/dev/null; then echo label
  else echo skip; fi
}

# Runs on the PR event itself (trusted, pull_request_target), so Preview shows up next to the other
# checks while the build is still running instead of only once the deploy starts.
queued() { # pr; env ACTION, LABEL, BODY_CHANGED, BODY_FROM from the event
  [ "$(cfg PREVIEW_ENABLED)" = true ] || return 0
  case "${ACTION:-}" in
    edited) [ "${BODY_CHANGED:-}" = true ] || return 0 ;;
    labeled) [ "${LABEL:-}" = preview ] || return 0 ;;
  esac
  local pull sha org gate host id st ssha shost
  pull=$(gh api "repos/$REPO/pulls/$1")
  # Same filter as the build's `relevant` job: a body edit only matters if the Backend URL line changed.
  if [ "${ACTION:-}" = edited ] && [ "$(bline "${BODY_FROM:-}")" = "$(bline "$(jq -r '.body // ""' <<< "$pull")")" ]; then
    return 0
  fi
  [ "$(jq -r .draft <<< "$pull")" = false ] || return 0
  sha=$(jq -r .head.sha <<< "$pull"); org=$(jq -r '.head.repo.full_name // "" | split("/")[0]' <<< "$pull")
  gate=$(gate_of "$(jq -r '.head.repo.full_name // ""' <<< "$pull")" "$(jq -c '[.labels[].name]' <<< "$pull")")
  if [ "$gate" = skip ]; then
    status "$sha" Preview success "No automatic preview for $org forks; a reviewer can add the preview label"; return 0
  fi
  read -r host _ < <(backend "$1") || return 0   # an invalid Backend URL is reported by the deploy side
  read -r id st ssha _ shost _ <<< "$(read_state "$1")"
  # Same commit and backend already live: the build will be a no-op (labels included), so don't flip
  # Preview to pending. Expired, evicted and failed previews aren't active, so the label still revives them.
  if [ "$st" = active ] && [ "$ssha" = "$sha" ] && [ "$shost" = "$host" ]; then return 0; fi
  status "$sha" Preview pending "Building on a GitHub runner (backend $host)"
}

# The deploy job only runs after a successful build, so a failed or cancelled build would leave the
# "Building" status from `queued` pending forever. Only that marker is replaced.
buildend() { # sha conclusion run-url
  local cur
  cur=$(gh api "repos/$REPO/commits/$1/status" | jq -r '[.statuses[] | select(.context == "Preview")][0] | "\(.state)|\(.description)"')
  [[ "$cur" == "pending|Building"* ]] || return 0
  if [ "$2" = cancelled ]; then
    # Cancelled because a newer event restarted the build for this commit: that run reports instead.
    local running
    running=$(gh api "repos/$REPO/actions/workflows/pr-checks.yml/runs?head_sha=$1&per_page=20" \
      --jq '[.workflow_runs[] | select(.status != "completed")] | length')
    (( running == 0 )) || return 0
    status "$1" Preview failure "Preview build was cancelled; push or add the preview label to retry" "$3"
  else
    status "$1" Preview failure "Preview build $2; see the build log" "$3"
  fi
}

deploy_tag() { # pr sha tag host comment-id
  local res dep
  res=$(coolify POST "/deploy?uuid=$COOLIFY_PREVIEW_APP&pr=$1&docker_tag=$3") || res=""
  dep=$(jq -r '[.deployments[]? | .deployment_uuid // empty][0] // empty' <<< "$res" 2>/dev/null || true)
  if [ -z "$dep" ]; then
    local why; why=$(jq -r '[.deployments[]?.message // empty, .message // empty][0] // "no deployment created"' <<< "$res" 2>/dev/null || echo "Coolify request failed")
    status "$2" Preview failure "Coolify didn't start a deployment: $why"
    write_state "$1" error "$2" "$3" "$4" - "Preview failed to start: $why" "$5"
    return 1
  fi
  # Record the deployment before posting pending, so an older watch can tell it's been superseded.
  write_state "$1" active "$2" "$3" "$4" "$dep" "$(url "$1") is deploying ${2:0:7} against \`$4\`. It's removed when the PR closes, or after ${TTL_H}h without a push." "$5"
  status "$2" Preview pending "Deploying in Coolify (backend $4)"
  [ -n "${GITHUB_OUTPUT:-}" ] && { echo "deployment=$dep"; echo "pr=$1"; echo "sha=$2"; } >> "$GITHUB_OUTPUT"
  return 0
}

# The PR into dev whose head is still this commit (open or closed), as JSON, or nothing. The
# commit->pulls endpoint also lists PRs that have since moved on, so the head must match: an older
# build must never resolve to a PR with a newer push.
pull_of() { # sha; fails if GitHub can't be asked, so callers don't mistake an outage for "superseded"
  local pull
  pull=$(gh api "repos/$REPO/commits/$1/pulls" | jq -c --arg s "$1" '[.[] | select(.base.ref == "dev" and .head.sha == $s)][0] // empty') || return 1
  # Fork commits aren't linked to base-repo PRs; fall back to matching the head sha.
  if [ -z "$pull" ]; then
    pull=$(gh api --paginate "repos/$REPO/pulls?state=open&base=dev&per_page=100" \
      | jq -cs --arg s "$1" 'flatten | map(select(.head.sha == $s))[0] // empty') || return 1
  fi
  printf '%s' "$pull"
}

deploy() { # head-sha image
  local sha=$1 tarball=$2 built=${3:-} pr pull org head_repo labels gate host override id st ssha shost
  pull=$(pull_of "$sha") || { echo "::error::Couldn't look up the PR for $sha."; return 1; }
  [ -n "$pull" ] || { echo "No PR into dev has head $sha (superseded); nothing to do."; return 0; }
  pr=$(jq -r .number <<< "$pull")
  # Closed while this build ran: a waiting close job may have been replaced by this one (same lock).
  if [ "$(jq -r .state <<< "$pull")" != open ]; then echo "PR #$pr is closed; cleaning up."; close "$pr"; return 0; fi
   head_repo=$(jq -r '.head.repo.full_name // ""' <<< "$pull")
  org=${head_repo%%/*}; labels=$(jq -c '[.labels[].name]' <<< "$pull")
  read -r id st ssha _ shost _ <<< "$(read_state "$pr")"; [ -n "$id" ] || id=-

  if ! read -r host override < <(backend "$pr"); then
    status "$sha" "Backend dependency" failure "Backend URL must look like https://api.<name>.groups.zedu.chat"
    status "$sha" Preview failure "Invalid Backend URL in the PR description"
    write_state "$pr" error "$sha" - - - "Not built: the \`Backend URL:\` line must look like \`https://api.<name>.groups.zedu.chat\`." "$id"
    return 0
  fi
  if [ "$override" = true ]; then
    status "$sha" "Backend dependency" failure "Depends on backend preview $host. Merge after it's on the live backend, then delete the Backend URL line."
  else
    status "$sha" "Backend dependency" success "Uses the live backend"
  fi

  gate=$(gate_of "$head_repo" "$labels")
  if [ "$gate" = skip ]; then
    [ "$st" = skipped ] || write_state "$pr" skipped "$sha" - - - "No automatic preview for \`$org\` forks. A reviewer can add the \`preview\` label." "$id"
    status "$sha" Preview success "No automatic preview for $org forks; a reviewer can add the preview label"
    return 0
  fi
  # The body was edited after this build started; that edit triggered a newer build.
  if [ -n "$built" ] && [ "$built" != "$host" ]; then
    echo "PR #$pr: image built for $built but the PR now asks for $host; a newer build will deploy."; return 0
  fi
  if [ "$tarball" = - ] || [ ! -s "$tarball" ]; then
    echo "::warning::PR #$pr passed the gate but the build produced no image."; return 0
  fi
  # Same commit and backend already live: nothing to do. An expired or evicted preview isn't
  # active, so a push or the `preview` label (both trigger a build) redeploys it.
  if [ "$st" = active ] && [ "$ssha" = "$sha" ] && [ "$shost" = "$host" ]; then
    echo "PR #$pr: preview already running for ${sha:0:7} against $host."; return 0
  fi

  local tag="pr-$pr-${sha:0:7}"
  if dry; then echo "  [dry-run] docker push $IMAGE:$tag" >&2
  else
    local loaded; loaded=$(gunzip -c "$tarball" | docker load | sed -n 's/^Loaded image: //p' | tail -1)
    [ -n "$loaded" ] || { echo "::error::Artifact holds no image."; return 1; }
    docker tag "$loaded" "$IMAGE:$tag"
    docker push -q "$IMAGE:$tag" >/dev/null
  fi

  # Cap: this PR's own slot is reused; otherwise evict the oldest. A failed delete frees nothing.
  local running; running=$(labelled "$LIVE" | grep -vxc "$pr" || true)
  if (( running >= CAP )); then
    local oldest; oldest=$(active_previews | awk -v p="$pr" '$2 != p { print $2; exit }')
    [ -n "$oldest" ] && remove "$oldest" evicted "Stopped to free a slot (cap: $CAP). Push a commit or ask a reviewer for the \`preview\` label to bring it back." \
      && running=$(( running - 1 ))
  fi
  if (( running >= CAP )); then
    status "$sha" Preview pending "Queued: all $CAP preview slots are in use"
    write_state "$pr" queued "$sha" "$tag" "$host" - "Queued: all $CAP preview slots are in use. It deploys automatically when one frees up." "$id"
    return 0
  fi
  deploy_tag "$pr" "$sha" "$tag" "$host" "$id"
}

watch() { # deployment-uuid -> result=<status> in GITHUB_OUTPUT; writes nothing else
  local s="" i
  for (( i = 0; i < 60; i++ )); do
    if ! s=$(coolify GET "/deployments/$1" | jq -r '.status // empty'); then
      echo "::error::Coolify refused the deployment status request. COOLIFY_TOKEN needs the read permission."
      s=unreadable; break
    fi
    case "$s" in finished|failed|cancelled*) break ;; esac
    dry && break; sleep 15
  done
  echo "Deployment $1: ${s:-unknown}"
  [ -n "${GITHUB_OUTPUT:-}" ] && echo "result=${s:-unknown}" >> "$GITHUB_OUTPUT"
  return 0
}

# Runs under the per-PR lock (fe-preview-pr-<N>): a newer deployment for the same PR wins.
settle() { # pr sha deployment result
  local id st sha tag host dep at
  # This job may have replaced a waiting close for the same PR (one waiting job per lock).
  local pstate
  pstate=$(gh api "repos/$REPO/pulls/$1" --jq .state) || { echo "::error::Couldn't read PR #$1; not settling."; return 1; }
  if [ "$pstate" != open ]; then
    echo "PR #$1 closed while deploying; cleaning up."; close "$1"; return 0
  fi
  read -r id st sha tag host dep at <<< "$(read_state "$1")"
  if [ "$st" != active ] || [ "$dep" != "$3" ]; then
    echo "PR #$1: deployment $3 was superseded or removed; leaving Preview alone."; return 0
  fi
  case "$4" in
    finished)
      write_state "$1" active "$sha" "$tag" "$host" - "$(url "$1") serves ${sha:0:7} against \`$host\`. It's removed when the PR closes, or after ${TTL_H}h without a push." "$id"
      status "$sha" Preview success "Preview is live" "$(url "$1")" ;;
    # Not active any more, so the next push or `preview` label redeploys instead of skipping.
    failed|cancelled*)
      write_state "$1" error "$sha" "$tag" "$host" - "Preview deployment $4 in Coolify. Push a commit or ask a reviewer for the \`preview\` label to retry." "$id"
      status "$sha" Preview failure "Coolify deployment $4; push or add the preview label to retry" ;;
    unreadable) status "$sha" Preview pending "Deploying; status unreadable (COOLIFY_TOKEN needs read)" "$(url "$1")" ;;
    *) echo "PR #$1: deployment $3 still $4; the sweep settles it." ;;
  esac
}

close() { # pr
  remove "$1" removed "Removed: PR closed." || true
  dry && return 0
  local ids
  ids=$(gh api --paginate "orgs/$OWNER/packages/container/zedu-fe-preview/versions?per_page=100" 2>/dev/null \
    | jq -rs --arg p "pr-$1-" 'flatten | .[] | select(any(.metadata.container.tags[]?; startswith($p))) | .id' || true)
  for v in $ids; do
    gh api -X DELETE "orgs/$OWNER/packages/container/zedu-fe-preview/versions/$v" >/dev/null 2>&1 \
      || echo "::warning::Couldn't delete image version $v for PR #$1."
  done
}

sweep() {
  local n id st sha tag host dep at s live queue free pstate entry
  local -a waiting=()
  live=$(labelled "$LIVE"); queue=$(labelled "$QUEUED")
  free=$(( CAP - $(grep -c . <<< "$live" || true) ))
  # Two passes, oldest PR first in each: first everything that can free a slot (closed, expired,
  # stale labels), then queued previews, so a queued PR never misses a slot freed by a newer one.
  for n in $(printf '%s\n%s\n' "$live" "$queue" | grep . | sort -nu); do
    read -r id st sha tag host dep at <<< "$(read_state "$n")"
    # A failed lookup must never read as "closed": skip the PR rather than delete a live preview.
    pstate=$(gh api "repos/$REPO/pulls/$n" --jq .state) || { echo "::warning::PR #$n: couldn't read state; skipped."; continue; }
    if [ "$pstate" != open ]; then
      # Closed with a slot still held: a close that never ran, or failed to delete.
      case "$st" in
        active) remove "$n" removed "Removed: PR closed." && free=$(( free + 1 )) ;;
        queued) write_state "$n" removed "$sha" "$tag" "$host" - "Queue entry dropped: PR closed." "$id" ;;
      esac
      continue
    fi
    case "$st" in
      active)
        if (( NOW - at > TTL_H * 3600 )); then
          remove "$n" expired "Expired after ${TTL_H}h without a push. Push a commit or ask a reviewer for the \`preview\` label to bring it back." \
            && free=$(( free + 1 ))
        elif [ "$dep" != - ]; then
          # Settle deployments the watch job didn't see finish.
          s=$(coolify GET "/deployments/$dep" | jq -r '.status // empty' 2>/dev/null || true)
          case "$s" in
            finished) status "$sha" Preview success "Preview is live" "$(url "$n")"
                      write_state "$n" active "$sha" "$tag" "$host" - "$(url "$n") serves ${sha:0:7} against \`$host\`. It's removed when the PR closes, or after ${TTL_H}h without a push." "$id" ;;
            failed|cancelled*)
              write_state "$n" error "$sha" "$tag" "$host" - "Preview deployment $s in Coolify. Push a commit or ask a reviewer for the \`preview\` label to retry." "$id"
              status "$sha" Preview failure "Coolify deployment $s; push or add the preview label to retry" ;;
          esac
        fi ;;
      queued) waiting+=("$n $id $sha $tag $host") ;;
      *)
        # Any other state (skipped, expired, evicted, removed, error, or no state comment) holds no
        # preview: a label left behind by a failed label update would hold a slot forever.
        if grep -qxF "$n" <<< "$live"; then free=$(( free + 1 )); fi
        label_sync "$n" - "${st:-none}" ;;
    esac
  done
  for entry in "${waiting[@]}"; do
    read -r n id sha tag host <<< "$entry"
    (( free > 0 )) || break
    # Re-check what was true at queue time: head, gate and backend may have changed since.
    local pull why="" bhost
    pull=$(gh api "repos/$REPO/pulls/$n")
    if [ "$(jq -r .head.sha <<< "$pull")" != "$sha" ]; then why="a newer push superseded it"
    elif [ "$(gate_of "$(jq -r '.head.repo.full_name // ""' <<< "$pull")" "$(jq -c '[.labels[].name]' <<< "$pull")")" = skip ]; then why="the PR no longer qualifies for a preview"
    elif ! read -r bhost _ < <(backend "$n") || [ "$bhost" != "$host" ]; then why="its Backend URL changed"
    fi
    if [ -n "$why" ]; then
      write_state "$n" removed "$sha" "$tag" "$host" - "Queue entry dropped: $why. The next build re-queues it if it still qualifies." "$id"
    else
      deploy_tag "$n" "$sha" "$tag" "$host" "$id" && free=$(( free - 1 ))
    fi
  done
  return 0
}

# One-off: label PRs whose previews predate the labels (reads state for every open PR once).
relabel() {
  local n st
  for n in $(gh api --paginate "repos/$REPO/pulls?state=open&base=dev&per_page=100" --jq '.[].number'); do
    read -r _ st _ <<< "$(read_state "$n")"
    case "$st" in active|queued) echo "PR #$n: $st"; label_sync "$n" - "$st" ;; esac
  done
}

case "${1:-}" in
  deploy) deploy "${2:?head sha}" "${3:--}" "${4:-}" ;;
  prnum) pull_of "${2:?sha}" | jq -r '.number // empty' ;;
  buildend) buildend "${2:?sha}" "${3:?conclusion}" "${4:-}" ;;
  queued) [[ "${2:-}" =~ ^[0-9]+$ ]] || { echo "Usage: $0 queued <pr>" >&2; exit 1; }; queued "$2" ;;
  watch) watch "${2:?deployment}" ;;
  settle) settle "${2:?pr}" "${3:?sha}" "${4:?deployment}" "${5:?result}" ;;
  close) [[ "${2:-}" =~ ^[0-9]+$ ]] || { echo "Usage: $0 close <pr>" >&2; exit 1; }; close "$2" ;;
  sweep) sweep ;;
  relabel) relabel ;;
  *) echo "Usage: $0 deploy <sha> <image> [host] | watch <deployment> | settle <pr> <sha> <deployment> <result> | close <pr> | sweep" >&2; exit 1 ;;
esac
