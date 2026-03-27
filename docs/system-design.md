# RenderLite System Design (Current State + Roadmap)

This document describes RenderLite **as it exists in this repo today**, and a practical path to evolve it into a minimal self-hosted PaaS (build → run → route → observe).

## Goals (what the system is trying to be)

- **Git-based deployments**: import a repo, build it, run it.
- **Container isolation**: one service per container, separate networks.
- **Dynamic routing**: `service.renderlite.local` (and later custom domains).
- **Operational UX**: deployment history, logs, status, rollbacks (later).

Non-goals (for early phases):

- Multi-region scheduling, full Kubernetes-like orchestration, autoscaling.

## Repo layout (monorepo)

- `apps/web`: Next.js dashboard (App Router).
- `apps/server`: Express API + orchestration logic + Prisma.
- `packages/*`: shared config/UI (not required for core orchestration).

## Current implementation snapshot (what exists today)

### Backend: Express API (`apps/server`)

The API is mounted at `/api/v1` (see `apps/server/src/index.ts` and `apps/server/src/module/app/app.route.ts`).

Implemented capabilities:

- **Health**
  - `GET /api/v1/health`

- **Auth (GitHub OAuth → local user)**
  - `GET /api/v1/auth/github/callback?code=...`
    - exchanges `code` for GitHub token
    - fetches GitHub user profile
    - upserts `User` + `Account`
    - sets cookies: `renderLite-access`, `renderLite-refresh`
  - `GET /api/v1/auth/refresh-token`
  - `DELETE /api/v1/auth/github/logout`

- **GitHub App integration**
  - `GET /api/v1/github/install?installation_id=...&code=...` (JWT cookie required)
    - fetches installation details via GitHub App JWT
    - upserts `GithubInstallation` for the user’s account
  - `GET /api/v1/github/repositories?q=...`
    - reads user from `renderLite-access`
    - fetches installation token + repos from GitHub
    - returns filtered repo list

Not implemented yet:

- `project` domain (folder exists but is empty: `apps/server/src/module/project/`)
- build pipeline, Docker runtime, routing/proxy, log streaming

### Database: Prisma (`apps/server/prisma/schema.prisma`)

Current schema supports:

- `User`
- `Account` (provider account, encrypted token fields)
- `Session` (not currently used in the routes above)
- `GithubInstallation` (installation metadata + link to `Account`)

There is **no** `Project`, `Service`, `Deployment`, etc. yet.

### Frontend: Dashboard (`apps/web`)

Implemented screens / flows:

- **New project page**: `/new/project`
  - server component `GithubRepo.tsx` fetches repos from backend using `renderLite-access` cookie
  - client component `GithubRepoList.tsx` provides search and “Connect GitHub account” button

- **GitHub App install via popup**
  - `window.open('https://github.com/apps/renderlite/installations/select_target', ...)`
  - install callback page: `apps/web/app/api/auth/github/install/callback/page.tsx`
    - calls `/api/auth/github/install?...`
    - `postMessage`s `{ type: 'github_install_success' | 'github_install_error', ... }` to opener
    - attempts `window.close()`

Not implemented yet:

- “Import repo” → create project → deploy pipeline
- deployment detail pages, logs UI

## High-level architecture (target)

### Components

- **Dashboard (Next.js)**
  - user-facing UI
  - calls API orchestrator for auth, repo import, deployment actions

- **API Orchestrator (Express)**
  - auth + GitHub integrations
  - owns the “control plane” concepts (Projects, Services, Deployments)
  - triggers build/run operations (initially in-process; later via jobs)

- **Postgres**
  - source of truth for users, projects, deployments, routing config

- **Runtime worker(s) (future)**
  - executes build/run steps
  - emits logs and status updates

- **Reverse proxy (future)**
  - Caddy or Nginx
  - routes external traffic to the right container based on host header

### Data flow (control plane vs data plane)

- **Control plane**: API + DB (create projects, start deployments, track state)
- **Data plane**: containers + proxy (serve actual web traffic)

## Key flows (current + planned)

### 1) Sign in (already implemented)

1. Dashboard redirects user to GitHub OAuth.
2. GitHub redirects back with `code`.
3. Server `GET /api/v1/auth/github/callback`:
   - exchanges code → access token
   - fetches user
   - upserts DB
   - sets `renderLite-access` cookie for subsequent API calls

### 2) Install GitHub App (already implemented)

1. Dashboard opens GitHub App install in a popup.
2. Popup ends on callback page.
3. Callback calls backend `/api/v1/github/install`.
4. Backend upserts `GithubInstallation`.
5. Popup `postMessage`s success/error to dashboard and closes.

### 3) List repositories (already implemented)

1. Dashboard calls `GET /api/v1/github/repositories?q=...`.
2. Backend:
   - finds user
   - gets installation token
   - calls GitHub API
   - filters by query

### 4) Import repo → create project (Phase 1 target)

1. User clicks “Import” on a repo in dashboard.
2. Dashboard calls `POST /api/v1/projects`.
3. Backend:
   - validates repo exists and is accessible via installation token
   - creates `Project` record and default `Service`

### 5) Deploy (Phase 2 target)

1. User clicks “Deploy” (or deploy is triggered automatically on import).
2. Backend creates a `Deployment` record in `queued`.
3. Worker performs:
   - clone repo at commit SHA
   - detect build strategy (Dockerfile vs generated)
   - build image
   - run container
4. Backend updates deployment status and publishes routing changes.

### 6) Route traffic (Phase 2/3 target)

1. Proxy routes `service.renderlite.local` → container IP:port
2. Proxy config is generated from DB “Routes” table (or equivalent).

### 7) Logs / observability (Phase 3 target)

- Store build logs + runtime logs.
- Stream logs to dashboard via SSE or WebSockets.

## Proposed data model (next schema additions)

These are additive and align to the UI that already exists.

### `Project`

- `id`
- `ownerUserId`
- `provider` (e.g. `GITHUB`)
- `repoFullName` (e.g. `org/name`)
- `repoId` (GitHub ID)
- `defaultBranch`
- `createdAt`, `updatedAt`

### `Service`

- `id`
- `projectId`
- `name` (unique within project)
- `type` (`web`, `worker`)
- `buildCommand`, `startCommand` (optional for non-Dockerfile)
- `port` (container port exposed)
- `env` (key/value; store encrypted if sensitive)

### `Deployment`

- `id`
- `projectId`, `serviceId`
- `status` (`queued`, `building`, `running`, `failed`, `succeeded`)
- `gitRef`, `commitSha`
- `imageTag`
- `createdAt`, `startedAt`, `finishedAt`

### `BuildLog` / `RuntimeLog` (optional split)

- `id`
- `deploymentId`
- `timestamp`
- `stream` (`stdout`/`stderr`)
- `message`

### `Route`

- `id`
- `serviceId`
- `host` (subdomain/custom domain)
- `targetPort`
- `enabled`

## Proposed API surface (what to add)

### Projects

- `POST /api/v1/projects`
  - body: `{ repoFullName: string }` (and/or `repoId`)
- `GET /api/v1/projects`
- `GET /api/v1/projects/:id`

### Deployments

- `POST /api/v1/projects/:id/deployments`
- `GET /api/v1/projects/:id/deployments`
- `GET /api/v1/deployments/:id`

### Logs

- `GET /api/v1/deployments/:id/logs` (paged)
- `GET /api/v1/deployments/:id/logs/stream` (SSE)

## Security model (current + recommended)

Current:

- JWT stored in HTTP-only cookie `renderLite-access`.
- Server middleware reads cookie and sets `req.userId`.

Recommended next steps:

- Tighten CORS + cookie domain/samesite for prod.
- Ensure consistent `provider` casing (`GITHUB` vs `github`) across DB and checks.
- Encrypt tokens at rest (you already encrypt OAuth access token).
- Prefer installation tokens (short-lived) over storing long-lived access tokens.

## Operational concerns / constraints

- **Long-running builds**: do not block HTTP requests; use jobs/queue (even if in-process at first).
- **Idempotency**: deployments should be retryable; store state transitions.
- **Resource control**: limit concurrent builds, set container memory/cpu caps.
- **Routing updates**: proxy config changes should be atomic and validated.

## Roadmap (phased plan)

### Phase 0 — Stabilize existing flows (1–2 days)

- Unify logging usage and remove remaining `console.log`.
- Ensure GitHub App install flow sets “installing” state correctly and handles popup close reliably.
- Normalize GitHub provider casing (`GITHUB` vs `github`) across backend.

### Phase 1 — “Projects” as a control-plane primitive (2–4 days)

- Add Prisma models: `Project`, `Service`.
- Add API endpoints: create/list/get projects.
- Update dashboard “Import” button to call `POST /projects`.

Success criteria:

- A user can import a repo and see it in a “Projects” list.

### Phase 2 — Minimal deployment pipeline (4–10 days)

- Add `Deployment` model.
- Implement job runner (in-process worker is acceptable initially).
- Implement: clone → build → run container (Docker API).
- Persist status transitions and basic logs.

Success criteria:

- A repo can be deployed and results in a running container reachable locally.

### Phase 3 — Routing + logs UX (5–12 days)

- Add `Route` model.
- Generate proxy config from DB.
- Add log streaming endpoint + dashboard log viewer.

Success criteria:

- `service.renderlite.local` routes to the deployed container and logs are visible in UI.

## Known gaps / risks (from current codebase)

- The `project` module folder exists but has no routes/services yet.
- Popup close detection should use polling (`popup.closed`) or the callback `postMessage` (browser does not emit a reliable `close` event for windows).
- Logging is currently split between `libs/logger` and `middlewares/httplogger.middleware` re-export; establish one import path.
