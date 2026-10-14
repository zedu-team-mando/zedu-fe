## Ticket

<!-- Link the approved ClickUp/Linear ticket. -->

- **Ticket ID:** <!-- e.g. CHAT-142 -->
- **Ticket title:**

## Team lead

<!-- @handle of your team lead. They review and approve before Zedu reviewers pick this up. -->

@

## What changed

<!-- Short summary of the change. -->

## Why

<!-- The problem or reason this ticket exists. -->

## How to test

<!-- Numbered steps a reviewer can follow to verify the change themselves. -->

1.

## What to expect

<!-- The expected behaviour after following the steps above. -->

## Backend

<!-- Leave this section empty: your preview runs against the live backend. Use a test account, not a real one.
     Only if this PR needs backend work that isn't on dev yet, add a line here starting with "Backend URL:"
     followed by that backend's host, for example https://api.<team>.groups.zedu.chat. The Backend dependency
     check then blocks merging until the backend lands on the live backend and you delete the line. -->

## Test evidence

<!-- The Build check reports the build result automatically. Say which backend you tested against,
     and whether tests were added or updated for what this ticket changed (and why not, if not). -->

- Tested against:
- Tests:

## Mandatory checks

_A consolidated team PR ticks **Atomic** per ticket and lists its tickets in the description. The Size check is switched off for now._

- [ ] **Atomic:** one logical change, at most ~400 lines of meaningful code (lockfiles and generated files like `*.tsbuildinfo` don't count). Larger needs a `size-override` label from a reviewer.
- [ ] **Database / API contract:** schema changes follow Expand-Contract — no destructive drops or renames.
- [ ] **Preview:** I checked the change in the PR's preview (or ran it locally, if the PR has no preview).
- [ ] **Protected files:** I did not change `.github/`, `AGENTS.md`, `CONTRIBUTING.md` or tooling config without reviewer agreement and the `config-change-approved` label.

## Screenshots / recording

<!-- Required for visible or interactive changes. Otherwise write "N/A, non-visual change". -->

## Checklist

- [ ] Linked to an approved ticket
- [ ] Only intended files changed
- [ ] No secrets or debug code committed
- [ ] Tests added/updated for what this ticket changed (not retroactive coverage of unrelated code)
- [ ] Team lead approved this PR
- [ ] Self-reviewed (`git status` / `git diff`)
