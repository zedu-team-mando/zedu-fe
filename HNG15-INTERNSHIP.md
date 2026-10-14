# HNG15 internship — how your work flows

A one-page map of what happens to your ticket, from branch to `dev`. The rules and the commands are
in [`CONTRIBUTING.md`](./CONTRIBUTING.md); this is the order of things and who does what.

One ticket = one branch = one PR = one squash commit. You own your PR end to end: your team lead
approves it, then a Zedu reviewer reviews it and merges.

## 1. Where your work lives

```
zeduchat/zedu-fe              Zedu's repo. Reviewers send batches here; you never touch it.
  └─ zedu-hng/zedu-fe         Review org. Your PR lands on its `dev` branch.
       └─ <your-team>/zedu-fe Your team's fork. You branch from `dev` and push here.
```

Your team org owns that fork — you **clone** it; you don't create your own. Your lead keeps its `dev`
synced with `zedu-hng`; you just pull before branching.

| Branch in the team fork     | What it's for                                            |
| --------------------------- | -------------------------------------------------------- |
| `dev`                       | Mirror of `zedu-hng:dev`. Sync only; never commit to it. |
| `<type>/<ticket-id>-<desc>` | One ticket. The only branch you open a PR from.          |

## 2. The loop

1. Your ticket is approved — move it to **IN PROGRESS**.
2. Get the latest `dev` from your team's fork, then branch as `<type>/<ticket-id>-<desc>`.
3. Make the change and test it locally against your team's backend.
4. Push the branch and open **one** PR to `zedu-hng/zedu-fe:dev`.
5. **PR checks** build the PR (**Build**), and a **Preview** link appears when it's ready.
6. Your **team lead** reviews the diff and the preview, then approves — **Lead approved** goes green.
7. A Zedu reviewer claims it (`/claim`), reviews the diff and the preview, then **squash merges**.
8. Your team syncs its fork's `dev`. Reviewers then promote `dev` → `central-staging` and release that to `zeduchat` in batches, on to `staging` and `main`.

## 3. Who does what

- **You** open one PR per ticket, keep it small (~400 meaningful lines), and push fixes to the same
  branch. You never push to `zedu-hng` or `zeduchat`.
- **Your team lead** gives the first approval. If your lead isn't around, the deputy lead can approve
  instead.
- **A Zedu reviewer** takes the PR after it's lead-approved and green, tests it, and merges it — or
  tells you what to fix.

## 4. What your PR runs

| Check                                    | Meaning for you                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------ |
| `Branch name`, `PR title`, `PR template` | Follow the naming and fill the template in.                              |
| `Single author`                          | One person per PR; credit helpers with `Co-authored-by`.                 |
| `Size`                                   | ~400 meaningful lines; larger needs a reviewer's `size-override`.        |
| `Protected files`                        | Don't change `.github/`, `AGENTS.md`, `CONTRIBUTING.md`, tooling config. |
| `Lead approved`                          | Your team lead's approval.                                               |
| `Build`                                  | Your code builds in the PR checks.                                       |
| `Preview`                                | A hosted, live build you and your lead can click through.                |
| Security scans                           | Gitleaks, Semgrep, ClamAV, dependency audit.                             |

## 5. First day, locally

- Clone your **team fork** and run `pnpm install` (installs the Husky hooks).
- Point your local `.env` at your team's scratch backend.
- Nothing else to configure; your lead handles the fork's settings.

## 6. Waiting, and getting unstuck

- A PR waits on two people: your lead first, then a reviewer. A nudge in your team channel is fine.
- Reviewers work a shared queue (`ready-for-review`), oldest first. A busy team's extra PRs wait as
  `queued` and are picked up automatically as slots free.
- The preview runs against the live backend (`api.zedu.chat`). Log in with a test account, not a real
  one. If your change needs backend work that isn't live yet, say so with a `Backend URL:` line in the PR description (see CONTRIBUTING) so it can't
  merge early.
- If a check fails, open its **Details**; the message names the fix.
