# Contributing to Zedu

Thank you for your interest in contributing to **Zedu** — a cross-platform collaboration workspace for messaging, channels, voice/video calls (Buzz), file sharing, search, notifications, and AI coworkers.

This guide covers two things: **how the code is organised** (onboarding) and **how work gets from a ticket into Zedu** (the team workflow in [Bootcamp Workflow](#bootcamp-workflow)). It is written against the **actual files and conventions in this repository**. If something here conflicts with another doc, treat this file and the code as the source of truth.

> **Naming note:** The npm package is named `zedu_fe` (see `package.json`). Infrastructure, Docker images, and some paths still use legacy **zedu** names. The user-facing product brand is **Zedu** (`zedu.chat`).

---

## Table of Contents

- [Ways to Contribute](#ways-to-contribute)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Project Overview](#project-overview)
- [Repository Structure](#repository-structure)
- [Architecture at a Glance](#architecture-at-a-glance)
- [Development Guidelines](#development-guidelines)
- [Common Development Tasks](#common-development-tasks)
- [Code Style and Quality](#code-style-and-quality)
- [Bootcamp Workflow](#bootcamp-workflow)
- [Testing](#testing)
- [Build and Deployment](#build-and-deployment)
- [Troubleshooting](#troubleshooting)
- [Additional Resources](#additional-resources)
- [Code of Conduct](#code-of-conduct)
- [License](#license)

---

## Ways to Contribute

| Type              | How                                                                                               |
| ----------------- | ------------------------------------------------------------------------------------------------- |
| **Bug reports**   | Open a GitHub issue with steps to reproduce, expected vs actual behavior, and screenshots or logs |
| **Feature ideas** | Open a GitHub issue describing the problem, proposed solution, and why it helps users             |
| **Documentation** | Improve `README.md`, this file, or `PRD.md`                                                       |
| **Code**          | Fix bugs, add features, improve performance, or refactor — follow the workflow below              |
| **Tests**         | Add or extend Cypress E2E specs under `cypress/e2e/`                                              |

Before starting significant work, check existing issues and coordinate with maintainers so effort is not duplicated.

---

## Prerequisites

| Tool                           | Version                                                    |
| ------------------------------ | ---------------------------------------------------------- |
| [Node.js](https://nodejs.org/) | `>= 20.0.0` (see `README.md`)                              |
| [pnpm](https://pnpm.io/)       | `>= 9.4.0` — project pins `pnpm@10.27.0` in `package.json` |
| [Git](https://git-scm.com/)    | Latest stable                                              |

Cypress is already a dev dependency (`pnpm cypress`). An editor with ESLint and Prettier support is recommended.

---

## Getting Started

### 1. Clone the team fork

Your team org already forked **`zedu-hng/zedu-fe`** into GitHub (the review repo, not `zeduchat`) — a one-time setup by your lead. You don't create your own fork; clone **the team fork**:

```sh
git clone git@github.com:<your-team>/zedu-fe.git
cd zedu-fe
```

The full repository topology and branch model are in [Bootcamp Workflow](#bootcamp-workflow).

### 2. Install dependencies

Use **pnpm** only:

```sh
pnpm install
```

### 3. Configure environment variables

Copy `env.example` (repo root) to `.env` and fill in your team's values. Ask your team lead if anything is missing. These variables are **referenced in the codebase today**:

**Required for most local development**

```env
# REST API (used by src/utils/new-request.ts and src/utils/request.ts)
NEXT_PUBLIC_BASE_URL=https://api.staging.zedu.chat/api/v1

# Public frontend URL (links, redirects, Centrifugo-related layout code)
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000

# Centrifugo WebSocket (src/components/layout/centrifugo/*.tsx)
NEXT_PUBLIC_CONNECT_URL=wss://<host>/connection/websocket

# OAuth (src/app/(auth)/layout.tsx, sign-up page, invitation layouts)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-client-id>
NEXT_PUBLIC_APPLE_CLIENT_ID=<apple-client-id>

# Buzz / Agora client (src/lib/agora/config.ts)
NEXT_PUBLIC_AGORA_APP_ID=<agora-app-id>
```

**Optional / feature-specific**

```env
# Google Analytics (src/app/layout.tsx)
NEXT_PUBLIC_GA_ID=<google-analytics-id>

# OneSignal push (src/lib/onesignal/init.ts)
NEXT_PUBLIC_ONESIGNAL_APP_ID=<onesignal-app-id>

# Integration API — used by src/utils/request.ts Integration* helpers
NEXT_PUBLIC_INTEGRATION_URL=<integration-api-url>

# Analytics webhooks — src/utils/webhook-request.ts
NEXT_PUBLIC_REGISTER_WEBHOOK_URL=<url>
NEXT_PUBLIC_LOGIN_WEBHOOK_URL=<url>
NEXT_PUBLIC_PAGE_VISIT_WEBHOOK_URL=<url>
NEXT_PUBLIC_SUCCESS_WEBHOOK_URL=<url>
NEXT_PUBLIC_ERROR_WEBHOOK_URL=<url>
```

**Server-only (Next.js API route `src/app/api/agora/token/route.ts`)**

```env
AGORA_APP_ID=<agora-app-id>
AGORA_APP_CERTIFICATE=<agora-certificate>
```

Without `NEXT_PUBLIC_BASE_URL` and a valid auth token flow, login and org-scoped routes will not work.

### 4. Run the development server

```sh
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Verify your setup

Before opening a PR:

```sh
pnpm check-format   # Prettier
pnpm check-lint     # ESLint
pnpm check-types    # TypeScript
pnpm build          # next build
# or all at once:
pnpm test-all
```

---

## Project Overview

Zedu consolidates team and learning-community collaboration into one workspace:

- **Messaging** — channels, direct messages, threads
- **Buzz** — real-time voice and video calls
- **Files** — upload, preview, share, and organize documents
- **Colleagues / AI coworkers** — browse and interact with AI agents
- **Search and notifications**
- **Organization settings** — users, roles, billing, permissions

This repository is the **web frontend**: **Next.js 16** (App Router), **React 19**, **TypeScript 5** (see `package.json`).

For product context and architecture, see [`PRD.md`](./PRD.md).

---

## Repository Structure

Verified top-level layout:

```
frontend/
├── .github/
│   ├── pull_request_template.md
│   ├── release.yaml
│   └── workflows/              # CI/CD (see Build and Deployment)
├── cypress/
│   ├── e2e/                    # E2E specs
│   ├── fixtures/
│   └── support/
├── docker/development/         # Dockerfile + docker-compose.yml
├── public/                     # Static assets
├── scripts/dev_deploy.sh       # Docker-based dev deploy script
├── src/
│   ├── app/                    # Next.js App Router routes + API routes
│   ├── assets/images/          # Image assets
│   ├── components/
│   │   ├── ui/                 # shadcn/ui primitives
│   │   ├── layout/             # sidebar, topbar, centrifugo, onesignal
│   │   ├── rbac/               # PermissionBoundary, withAuthGate HOCs
│   │   ├── auth/               # auth-session-setup.tsx
│   │   ├── modals/
│   │   ├── toast/              # Sonner helpers (sonner.tsx)
│   │   └── error-boundary/
│   ├── data/                   # Static/mock data
│   ├── hooks/                  # Custom hooks (incl. hooks/buzz/)
│   ├── lib/                    # agora/, buzz/, search/, onesignal/, utils.ts
│   ├── store/                  # GlobalState, Actions, Reducers, UploadContext
│   ├── types/                  # Shared TS types (incl. rbac.ts)
│   ├── utils/                  # HTTP clients, auth-session, rbac helpers
│   └── svgs/
├── components.json             # shadcn/ui config
├── commitlint.config.cjs       # Commit message rules
├── cypress.config.ts
├── next.config.mjs
├── package.json
├── PRD.md
├── README.md
├── sample.cypress.env.json     # Cypress env sample (repo root)
├── tailwind.config.ts
└── tsconfig.json               # path alias ~/ → src/*
```

---

## Architecture at a Glance

### Routing (Next.js App Router)

Routes live in `src/app/`. Parentheses are **route groups** — they do not appear in URLs.

| Route group                   | URL examples                                                              | Purpose               |
| ----------------------------- | ------------------------------------------------------------------------- | --------------------- |
| `(homepage)`                  | `/`, `/about`, `/pricing`, `/resources`, `/contact-sales`                 | Public marketing site |
| `(auth)`                      | `/auth/login`, `/auth/sign-up`, `/auth/forgot-password`                   | Authentication        |
| `(client)/[org]`              | `/{orgSlug}/home/channels/[id]`, `/{orgSlug}/buzz`, `/{orgSlug}/settings` | Authenticated app     |
| `(accept_org_invitation)`     | `/accept_org_invitation`                                                  | Accept org invite     |
| `(accept_general_invitation)` | `/accept_general_invitation`                                              | Accept general invite |
| `(client)/billing`            | `/billing/invoice/[id]`                                                   | Invoice view          |

**Layouts (verified paths):**

| File                                | Role                                                    |
| ----------------------------------- | ------------------------------------------------------- |
| `src/app/layout.tsx`                | Root: `DataProvider`, analytics scripts, `ClientLayout` |
| `src/app/(homepage)/layout.tsx`     | Marketing header/footer                                 |
| `src/app/(client)/layout.tsx`       | Nested `DataProvider`, `ErrorBoundary`                  |
| `src/app/(client)/[org]/layout.tsx` | Wraps children in `AuthGuard` + `ClientLayout`          |

**Next.js API routes** (`src/app/api/**/route.ts` only):

| Route                     | File                                      |
| ------------------------- | ----------------------------------------- |
| `/api/agora/token`        | `src/app/api/agora/token/route.ts`        |
| `/api/link-preview`       | `src/app/api/link-preview/route.ts`       |
| `/api/save-subscription`  | `src/app/api/save-subscription/route.ts`  |
| `/api/search`             | `src/app/api/search/route.ts`             |
| `/api/search/user-search` | `src/app/api/search/user-search/route.ts` |

> `src/app/api/files/file/getFileDetails.ts` is a helper module, **not** a Next.js route handler.

There is **no `middleware.ts`** in this repo. Auth is client-side.

### Authentication

| Concern        | Location / behavior                                                                   |
| -------------- | ------------------------------------------------------------------------------------- |
| Token storage  | `localStorage` keys include `token`, `orgId`, `orgSlug`, `user`                       |
| Route guard    | `src/app/(client)/[org]/_components/auth/auth-guard.tsx`                              |
| Guard usage    | Imported in `src/app/(client)/[org]/layout.tsx`                                       |
| Session setup  | `src/components/auth/auth-session-setup.tsx` (Axios interceptor)                      |
| Session expiry | `src/utils/auth-session.ts` — clears storage, redirects to `/auth/login?redirect=...` |
| Guard boot     | Parallel `GetRequest('/profile')` and `GetRequest('/organisations/${orgId}')`         |
| OAuth env      | `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_APPLE_CLIENT_ID`                         |

### Authorization (RBAC)

| Resource      | Path                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------- |
| Types         | `src/types/rbac.ts`                                                                                        |
| Utilities     | `src/utils/rbac.ts`                                                                                        |
| Hook          | `src/hooks/useRBAC.ts`                                                                                     |
| Components    | `src/components/rbac/PermissionBoundary.tsx`                                                               |
| HOCs          | `src/components/rbac/withAuthGate.tsx` — exports `withAuthGate`, `withAllPermissions`, `withAnyPermission` |
| Barrel export | `src/components/rbac/index.ts`                                                                             |

Permissions are string keys such as `invite:members`, `manage:channels`, `manage:roles`. See the full list in `src/types/rbac.ts` (`PermissionKey`).

Org role/permissions come from `orgData` in global state after `AuthGuard` loads the organisation.

### State management

| File                          | Role                                  |
| ----------------------------- | ------------------------------------- |
| `src/store/GlobalState.tsx`   | Exports `DataProvider`, `DataContext` |
| `src/store/Actions.ts`        | Action type constants                 |
| `src/store/Reducers.ts`       | Reducer                               |
| `src/store/UploadContext.tsx` | Upload state                          |

Pattern: React Context + `useReducer`. No Redux or Zustand. The `use-context-selector` package is available but not required for new code.

### API requests

Central Axios helpers (both files warn **DO NOT TOUCH** at the top):

| Module                          | Use when                                                          |
| ------------------------------- | ----------------------------------------------------------------- |
| `src/utils/new-request.ts`      | **Preferred** — reads `token` from `localStorage`                 |
| `src/utils/request.ts`          | Legacy — pass `token` explicitly; includes `Integration*` helpers |
| `src/utils/patchRequestForm.ts` | Multipart uploads                                                 |
| `src/utils/webhook-request.ts`  | Analytics webhook GET requests                                    |

**Pattern used across the app:**

```typescript
import { GetRequest, PostRequest } from "~/utils/new-request";
import { showSuccess, showError } from "~/components/toast/sonner";

const res = await GetRequest("/your-endpoint");

if (res?.status === 200 || res?.status === 201) {
  // use res.data
}
```

- Base URL: `process.env.NEXT_PUBLIC_BASE_URL`
- Toasts: `~/components/toast/sonner.tsx`
- `401` handling: `handleUnauthorizedIfNeeded` in `src/utils/auth-session.ts`

There is no React Query or SWR.

### Real-time (Centrifugo)

Connection components in `src/components/layout/centrifugo/`:

- `channel-connection.tsx`
- `chat-connection.tsx`
- `reply-connection.tsx`
- `general-notification-connection.tsx`
- `status-connection.tsx`
- `agora-connection.tsx`
- `chat-agora-connection.tsx`
- `channel-agora-connection.tsx`

They use `NEXT_PUBLIC_CONNECT_URL` and token endpoints on `NEXT_PUBLIC_BASE_URL`:

- `/token/connection`
- `/token/subscription`

### Voice and video (Agora / Buzz)

| Area                 | Path                                                              |
| -------------------- | ----------------------------------------------------------------- |
| Agora config/types   | `src/lib/agora/`                                                  |
| Buzz session helpers | `src/lib/buzz/`                                                   |
| Buzz hooks           | `src/hooks/buzz/`                                                 |
| Server token route   | `src/app/api/agora/token/route.ts`                                |
| Buzz UI              | `src/app/(client)/[org]/_components/buzz-management/`             |
| Buzz routes          | `src/app/(client)/[org]/buzz/`, `buzz/[id]/`, `buzz-record/[id]/` |

Dependencies: `agora-rtc-sdk-ng`, `agora-rtm-sdk`, `agora-token` (see `package.json`).

---

## Development Guidelines

### Where to put new code

| What you're building           | Where it goes                                |
| ------------------------------ | -------------------------------------------- |
| shadcn/ui primitive            | `src/components/ui/`                         |
| Shared cross-feature component | `src/components/<name>/`                     |
| Feature-local component        | `src/app/.../_components/`                   |
| Custom hook                    | `src/hooks/` (or `src/hooks/buzz/` for Buzz) |
| Shared types                   | `src/types/`                                 |
| HTTP/formatting/RBAC helpers   | `src/utils/`                                 |
| Domain logic                   | `src/lib/`                                   |
| Static mock data               | `src/data/`                                  |
| New page                       | `src/app/<route-group>/.../page.tsx`         |
| New API route                  | `src/app/api/<name>/route.ts`                |

Use `_components/` for route-local components (Next.js private folder convention).

### UI components (shadcn/ui)

Configured in `components.json`. Primitives live in `src/components/ui/`.

Add a component:

```sh
pnpm dlx shadcn@latest add <component-name>
```

Prefer existing shadcn primitives (`button`, `dialog`, `form`, `input`, etc.) before custom UI.

Icons: prefer **Lucide React** (`lucide-react`). Some legacy code uses Font Awesome.

### Forms and validation

The codebase uses **React Hook Form**, **Zod**, and `@hookform/resolvers`:

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
```

Pair with shadcn form primitives from `src/components/ui/form.tsx`, `input.tsx`, `label.tsx`, etc.

### Styling

- **Tailwind CSS** — primary approach
- `cn()` helper — `src/lib/utils.ts`
- Theme — `tailwind.config.ts`, CSS variables in `src/app/globals.css` (also `src/app/responsive.css`)
- Dark mode — `darkMode: ["class"]` in `tailwind.config.ts`

Production builds set `assetPrefix: "/mainapp"` in `next.config.mjs` (not in dev).

### Notifications and toasts

Use Sonner wrappers from `src/components/toast/sonner.tsx`:

```typescript
import { showSuccess, showError } from "~/components/toast/sonner";
```

Do not introduce CogoToast. `react-toastify` is a dependency but Sonner is the project standard for new code.

### Path aliases

`tsconfig.json` maps `~/` → `src/`:

```typescript
import { Button } from "~/components/ui/button";
import { GetRequest } from "~/utils/new-request";
import { useRBAC } from "~/hooks/useRBAC";
```

---

## Common Development Tasks

### Add a page in the authenticated app

1. Create `src/app/(client)/[org]/<feature>/page.tsx`
2. Add `"use client"` if the page uses hooks or browser APIs
3. Read org context from the URL (`[org]` param) or `DataContext`
4. Wire navigation in `src/components/layout/sidebar/` if needed

Example:

```
src/app/(client)/[org]/your-feature/
├── page.tsx
└── _components/
    └── feature-card.tsx
```

### Add a shared component

1. Create `src/components/<component-name>/`
2. Compose shadcn/ui + Tailwind
3. Add `"use client"` when using hooks or events

### Fetch data from the backend

```typescript
"use client";

import { useEffect, useState } from "react";
import { GetRequest } from "~/utils/new-request";

export function MyList() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<unknown[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await GetRequest("/items");
      if (res?.status === 200 || res?.status === 201) {
        setItems(res.data?.data ?? []);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return null;
  return null; // render items
}
```

### Gate UI behind permissions

Use a real `PermissionKey` from `src/types/rbac.ts`:

```typescript
import { PermissionBoundary } from "~/components/rbac";

<PermissionBoundary permission="invite:members">
  <InviteUserButton />
</PermissionBoundary>
```

For page-level gating, use HOCs from `src/components/rbac/withAuthGate.tsx`:

```typescript
import { withAuthGate } from "~/components/rbac";

export default withAuthGate(MyPage, {
  requiredPermission: "manage:roles",
});
```

---

## Code Style and Quality

### TypeScript and React

- Functional components and hooks
- `"use client"` on interactive components
- Strict TypeScript is enabled in `tsconfig.json`
- Note: `next.config.mjs` sets `typescript.ignoreBuildErrors: true` — still fix errors in files you touch

### Prettier (`.prettierrc`)

| Setting        | Value    |
| -------------- | -------- |
| Semicolons     | yes      |
| Quotes         | double   |
| Print width    | 80       |
| Tab width      | 2 spaces |
| Trailing comma | es5      |

```sh
pnpm format
```

### ESLint (`eslint.config.mjs`)

Flat config built on Next.js core-web-vitals and Prettier.

```sh
pnpm check-lint
pnpm lint:fix
```

### lint-staged and Husky

`package.json` runs lint + format on staged `src/**/*.{ts,tsx}` via `lint-staged`. Husky hooks live in `.husky/` and run Prettier, ESLint, TypeScript and the production build before each commit. Keep them enabled — fix the code rather than bypassing with `--no-verify`.

### Commit messages

Conventional Commits are defined in `commitlint.config.cjs`:

```
<type>(<optional-scope>): <subject>
```

**Allowed types:** `build`, `chore`, `ci`, `docs`, `feat`, `fix`, `perf`, `refactor`, `revert`, `style`, `test`

**Rules:** lowercase type; subject lowercase; no trailing period; max 100 characters.

Examples:

```
feat(channels): add archive button to channel header
fix(buzz): resolve mute state after reconnect
docs: expand contributing guide
```

Commitlint runs on your commit message via the `.husky/commit-msg` hook, and in CI on every commit in your PR (**Commit messages**). **PR rules** checks the PR title.

---

## Bootcamp Workflow

The short version:

> Approved ticket → ticket branch in your team's fork → test against your team's backend → **one PR** to `zedu-hng/zedu-fe:dev` → PR checks build it and a preview goes up → team lead approves → Zedu reviewers review with that build → squash merge → your team syncs.

New to the internship? [`HNG15-INTERNSHIP.md`](./HNG15-INTERNSHIP.md) is a one-page overview of how a ticket flows from the team fork to `dev`.

### 1. Ground rules

- **Every change needs an approved ticket** in ClickUp or Linear. Nothing starts from an untracked chat request.
- **Team PRs are allowed.** A team can consolidate several members' work into one PR from its fork. The **Single author**, **Branch name** and **Size** checks are switched off for now: they still report, as passed, and can be switched back on. For a consolidated PR, put the main ticket in the branch and in the title (`fix(CHAT-12): …`) and list the other tickets in the description. The earlier rule is kept for when it returns: _one ticket per PR, one person per PR. Each member opens their own PR from their own ticket branch, with no team branches and no combined PRs, so nobody's work is held up by someone else's. If you find another problem, open another ticket._
- **One logical change, about 400 lines.** _(The Size check is switched off for now; a consolidated PR can be larger.)_ Size PRs by scope, not time: with AI tools a day's work can be thousands of lines. A PR is one logical change of at most ~400 lines of meaningful code (lockfiles and generated files like `*.tsbuildinfo` don't count; `hotfix` PRs are exempt). Larger changes need a reviewer's `size-override` label, or they get split.
- **Shippable slice.** After your PR merges the app must still work and nothing half-finished may be visible to users. If a feature needs several tickets, land the non-visible parts first and open each dependent PR after the previous one merges (see [Working on a ticket](#4-working-on-a-ticket)).
- **One open PR per author.**
- **Your team lead reviews first.** They approve on your PR; Zedu reviewers pick it up after that.
- **Don't change protected files** (see [Protected files](#5-protected-files)) unless a reviewer has agreed first.
- **You never push to `zedu-hng` or `zeduchat` directly.** All work happens in your team's fork and comes in as a PR.
- **AI is a tool, not an authority.** You own everything you submit. If you can't explain it, don't submit it.

### 2. Repositories and branches

```
zeduchat/zedu-fe              Zedu's repo. Reviewers send batches here; you never touch it.
  └─ zedu-hng/zedu-fe         Review org. Your PRs land here.
       └─ <your-team>/zedu-fe Your team's fork. You work here.
```

| Branch in `zedu-hng` | Purpose                                                         | Who merges                                  |
| -------------------- | --------------------------------------------------------------- | ------------------------------------------- |
| `dev` (default)      | All PRs land here, from teams and reviewers alike.              | Reviewers, squash merge                     |
| `central-staging`    | What's ready to go to Zedu; mirrors `zeduchat:central-staging`. | Reviewers promote `dev` → `central-staging` |

`staging` and `main` live on `zeduchat/zedu-fe` and are owned by the in-house team. You never target them.

Branches in your team's fork:

| Branch in the team fork     | Purpose                                                                                                                                             |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `dev`                       | Mirror of `zedu-hng:dev`. Sync only; never commit to it.                                                                                            |
| `staging`                   | Team sandbox. Your lead merges ticket branches here to try them live on `<team>.groups.zedu.chat`. Never a PR source; reset it from `dev` any time. |
| `<type>/<ticket-id>-<desc>` | One ticket. The only branch you open a PR from. (The name format is not enforced for now; keep the main ticket in it.)                              |

Fork from **`zedu-hng/zedu-fe`**, not from `zeduchat`. Otherwise your PRs and **Sync fork** point at the wrong repo.

### 3. One-time setup (per team)

1. Fork `zedu-hng/zedu-fe` into your team's GitHub org.
2. Each contributor clones the **team fork** and installs with `pnpm install` (see [Getting Started](#getting-started)).

`pnpm install` installs the Husky hooks. On commit, Prettier, ESLint, TypeScript and the production build run, and commitlint checks your message.

### 4. Working on a ticket

1. Move the ticket to **IN PROGRESS**.
2. Pull the latest `dev` from your team's fork. Your team lead keeps it synced with `zedu-hng` (**Sync fork**); you don't create or sync a fork yourself.
3. Branch from `dev` using the ticket ID:

   ```
   <type>/<ticket-id>-<short-description>
   ```

   Types: `feat`, `fix`, `hotfix`, `test`, `docs`, `refactor`, `chore`, `perf`, `security`. The ticket ID is either a number or a prefix plus number. Example: `feat/CHAT-142-typing-indicator` or `fix/245-login-redirect`.

4. Commit with [Conventional Commits](https://www.conventionalcommits.org/) (see [Commit messages](#commit-messages)). The PR title must pass commitlint too, and it becomes the squashed commit message.
5. Commit only as yourself. The **Single author** check, which is switched off for now (a team PR may hold several people's commits), fails a PR with commits from more than one person when it is on. If you commit from several emails, add all of them to your GitHub account, or they count as different authors. Credit a collaborator with a `Co-authored-by:` trailer instead.

**Multi-ticket features:** GitHub doesn't support stacked PRs across forks, and a PR's base must be a branch in `zedu-hng`, so you can't base one ticket's PR on another's fork branch. Order the tickets so the additive, non-visible parts land first, and open each dependent PR after the previous one merges: sync `dev`, branch from it, and use the next ticket. The **PR title** check requires the PR's ticket to match its branch.

**Testing combinations:** you can merge ticket branches into a private branch in the team fork to test them together. Never open a PR from that branch.

### 5. Protected files

These files are owned by the reviewers. The **Protected files** check fails any PR that changes them, unless a reviewer has agreed the change first and added the `config-change-approved` label:

- `.github/` (workflows, templates, the review bot config);
- `AGENTS.md` and `CONTRIBUTING.md`;
- tooling config: `eslint.config.mjs`, `.prettierrc`, `.prettierignore`, `tsconfig.json`, `next.config.mjs`, `postcss.config.*`, `tailwind.config.*`, `commitlint.config.cjs`, `.gitleaks.toml`, `.semgrepignore`, `.husky/`, `.npmrc`;
- `package.json` and `pnpm-lock.yaml` when the change is tooling-only (dependency additions the ticket needs are fine).

**Moving or restructuring files needs its own approved ticket**; never mix it into feature work.

### 6. Opening a PR

1. Open a PR from your team fork's ticket branch into **`zedu-hng/zedu-fe:dev`**. Open it from the ticket branch, not the team fork's `dev`: that would drag in everything else merged there.
2. Fill in [`.github/pull_request_template.md`](.github/pull_request_template.md) completely:
   - the ticket link;
   - what changed and why;
   - how to test and what to expect;
   - your team lead's GitHub handle;
   - screenshots or a recording for visible changes.
3. Ask your team lead to review it and leave an **Approve** review.
4. Move the ticket to **IN REVIEW**.

### 7. How your PR gets built

Zedu builds your PR on GitHub's runners, on every push, with a public build config. Your fork needs no build setup, no secrets and no first run.

- The **Build** check shows the result. It is one of the **PR checks** statuses, so a failed build shows up next to ESLint and TypeScript.
- Comment nothing and trigger nothing: push to the ticket branch and the checks re-run.

**Previews.** Every PR from a registered team org gets a preview at `https://<PR number>.preview.groups.zedu.chat`, rebuilt on every push. Zedu builds it on GitHub's runners and hosts it, so your team sets nothing up. PRs from other forks get one when a reviewer adds the `preview` label.

- The **Preview** check links to it (Details) once it's live, and a bot comment shows the link, the commit and the backend it uses.
- It runs against the live backend (`api.zedu.chat`), the same data your ticket was raised against and the data reviewers test with. Log in with a test account, not a real one: a preview is PR-built code. If your PR needs backend work that isn't live yet, add a `Backend URL:` line to the PR description with that backend's host (for example `https://api.<team>.groups.zedu.chat`). The **Backend dependency** check then fails until the backend is live and you delete the line, so the PR can't merge against unreleased backend code.
- It's removed when the PR closes or after 48 hours without a push; the link comes back on your next push. Google sign-in and calls don't work in previews; use email login.

Before you open the PR, check your work locally, or ask your lead to merge your branch into the team fork's `staging` sandbox. The **Build** check proves it compiles; a preview proves it works.

The other checks run on the PR itself. **PR checks** runs file policy, Gitleaks, malware heuristics, commit messages, dependency audit, Prettier, ESLint, TypeScript, the review bot and the build in one job; **PR scans** runs Semgrep and ClamAV. Each check shows as its own status on the PR (ESLint, TypeScript, Build, ...), with the run's summary table listing every result. **PR rules** adds **Branch name**, **Single author**, **Protected files**, **Size**, **PR title** and **PR template**.

### 8. Review and merge

- **Your team lead approves first.** Zedu reviewers only pick up PRs the lead has approved.
- **1 Zedu reviewer approval** is required, and it must come after your last push.
- All checks must pass, including **Build**.
- All review threads must be resolved. Don't resolve a thread without actually addressing it.
- To address feedback, push to the same ticket branch. Checks re-run.
- Reviewers **squash-merge** into `dev`. Your PR title becomes the commit message, so keep it conventional.
- Contributors don't merge their own PRs.

After merge, reviewers promote `dev` → `central-staging` with a merge commit, and send `central-staging` to `zeduchat` in batches. Your lead syncs the team fork's `dev` (**Sync fork**); you pull to pick up what's merged. The ticket goes **MERGED → VERIFIED → CLOSED** once the change is verified.

### 9. Shippable slices

Zedu has no feature-flag system, so every PR must be safe to merge on its own: after it merges, the app still works and nothing half-finished is visible to users. If a feature needs several tickets, split it so the additive, non-visible parts (backend, database) land first and the visible UI change lands last, opening each ticket's PR after the previous one merges (see [Working on a ticket](#4-working-on-a-ticket)).

### 10. Security and secrets

Never commit API keys, tokens, passwords, private keys, certificates, cloud or database credentials, `.env` files with real values, or user data.

Anything prefixed `NEXT_PUBLIC_` is compiled into the browser bundle and readable by anyone. Treat it as public; real secrets belong on the backend, not the client. If you expose a secret, deleting it in the next commit is not enough — tell a reviewer immediately so it can be rotated. The **File policy**, **Gitleaks** and **Semgrep** checks enforce this.

### 11. Definition of done

- Acceptance criteria met.
- All checks green on the PR, including **Build**.
- Approved by your team lead and a Zedu reviewer, with all threads resolved.
- Merged into `zedu-hng:dev`.
- Verified in the build or preview.
- Ticket closed in ClickUp or Linear.

### 12. Getting unstuck

Ask in your team's channel first, then the project channel. For a blocker, include:

- the ticket number;
- what you were trying to do;
- what happened, with the error or build output;
- what you already tried;
- what help you need.

---

## Testing

### Required checks

Run the same checks CI runs before you open or update a PR:

```sh
pnpm check-format   # Prettier
pnpm check-lint     # ESLint
pnpm check-types    # TypeScript
pnpm build          # production build
pnpm test-all       # all of the above
```

The required gates are format, lint, types and a successful production build. There is no unit-test runner in this repo.

**What to change:** only what your ticket touched. Don't add retroactive tests or refactors to unrelated code in the same file. Noticed a real gap? File a separate ticket.

Manual verification against **your team's backend** in `pnpm dev`:

- the flow your ticket describes, including loading, empty and error states;
- layout at two viewport sizes (desktop and a narrow/mobile width);
- keyboard focus and accessible labels for anything interactive.

### Cypress (E2E only)

No Jest/Vitest/React Testing Library setup exists. Cypress covers end-to-end checks of critical flows.

**Run:**

```sh
pnpm cypress
```

**Spec layout** (actual paths under `cypress/e2e/`):

```
cypress/e2e/
├── auth/
│   ├── login.cy.js
│   ├── logout.cy.js
│   ├── forgot_password.cy.js
│   └── test_signup_dashboard.cy.js
├── profile/
│   ├── test_e2e_profile_update.cy.js
│   ├── test_e2e_change_password.cy.ts
│   └── ...
├── settings/
│   └── test_e2e_create_role.cy.js
├── faq/
│   └── test_zedu_faqpage.cy.js
├── blogs/
│   └── test_talex_blogpage.cy.js
├── test_zedu_homepage.cy.js
└── example.cy.ts
```

Configure base URL in `cypress.config.ts` or `cypress.env.json`. See `sample.cypress.env.json` at the repo root.

---

## Build and Deployment

### Local production build

```sh
pnpm build   # next build — standalone output
pnpm start   # next start
```

`next.config.mjs`: `output: "standalone"`, `reactStrictMode: false`, `typescript.ignoreBuildErrors: true`.

### GitHub Actions (`.github/workflows/`)

| Workflow                                                                               | Trigger                       | Purpose                                                                                                                              |
| -------------------------------------------------------------------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `pr-checks.yml`                                                                        | PR → `dev`, `central-staging` | File policy, Gitleaks, malware heuristics, commit messages, audit, Prettier, ESLint, TypeScript, review bot, build (+ preview image) |
| `pr-scans.yml`                                                                         | PR → `dev`, `central-staging` | Semgrep, ClamAV                                                                                                                      |
| `pr-review-comment.yml`                                                                | After PR checks / PR scans    | Posts each check as a status, and the review bot's comment                                                                           |
| `pr-rules.yml`                                                                         | PR → `dev`, `central-staging` | Branch name, single author, protected files, size, title, template                                                                   |
| `pr-pre-commit-checks.yml`, `pr-review.yml`, `security-checks.yml`, `malware-scan.yml` | Disabled in `zedu-hng`        | Zedu's originals, replaced by the two above; kept unchanged so syncs don't conflict                                                  |
| `deploy-staging.yml`                                                                   | Push / dispatch → `staging`   | Deploy staging (self-hosted runner)                                                                                                  |
| `deploy-main.yml`                                                                      | Push / dispatch → `main`      | Deploy production (self-hosted runner)                                                                                               |

### Docker

- `docker/development/Dockerfile`
- `docker/development/docker-compose.yml`
- `scripts/dev_deploy.sh` — pulls `hngtechie/zedu:dev` and runs compose

> `scripts/dev_deploy.sh` runs `git pull origin dev`, but no `dev` branch exists on the current remote. Treat that script as legacy or confirm branch names with the team before using it.

---

## Troubleshooting

| Problem                           | What to check                                                               |
| --------------------------------- | --------------------------------------------------------------------------- |
| Login loops or immediate redirect | `NEXT_PUBLIC_BASE_URL`, OAuth client IDs, network tab on `/profile`         |
| Real-time not working             | `NEXT_PUBLIC_CONNECT_URL`, WebSocket in network tab                         |
| Buzz/calls fail                   | `NEXT_PUBLIC_AGORA_APP_ID`, server `AGORA_APP_ID` / `AGORA_APP_CERTIFICATE` |
| `pnpm install` fails              | Node 20+, pnpm 9.4+                                                         |
| `~/` imports fail in editor       | Restart TS server; file must be under `src/`                                |
| Build succeeds with TS errors     | `ignoreBuildErrors: true` — fix types in your changes anyway                |
| Lint fails                        | `pnpm lint:fix && pnpm format`                                              |

---

## Additional Resources

| Resource                                                     | Description                                    |
| ------------------------------------------------------------ | ---------------------------------------------- |
| [`README.md`](./README.md)                                   | Quick start                                    |
| [`PRD.md`](./PRD.md)                                         | Product requirements and frontend architecture |
| [`components.json`](./components.json)                       | shadcn/ui configuration                        |
| [shadcn/ui docs](https://ui.shadcn.com/docs/components)      | UI components                                  |
| [Next.js App Router](https://nextjs.org/docs/app)            | Routing and layouts                            |
| [Conventional Commits](https://www.conventionalcommits.org/) | Commit format                                  |

---

## Code of Conduct

By participating, you agree to uphold the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/0/code_of_conduct/). Report unacceptable behavior to the project maintainers.

---

## License

There is **no `LICENSE` file** in this repository at present. Ask maintainers about licensing terms before contributing if that matters for your contribution.

---

Thank you for helping improve Zedu.
