# RenderLite

RenderLite is a self-hosted, Render/Vercel-style Platform-as-a-Service (PaaS) that you run on your own machine. You connect a GitHub repository, and RenderLite handles the rest: it clones the source, detects the project type, builds a container image, runs the container, and exposes the resulting service on a routable subdomain.

The project is built as a learning-oriented systems engineering exercise — a working slice of the orchestration, build, queueing, and routing problems that real PaaS providers solve in production.

---

## What RenderLite Does

At a high level, RenderLite turns a Git repository into a running, reachable service through four stages:

1. **Source ingestion.** A user signs in with GitHub OAuth, installs the RenderLite GitHub App on the repositories they want to deploy, and picks a repo from the dashboard.
2. **Project creation.** The dashboard issues a request to the orchestrator API, which records the repo as a `Project` with a default service configuration in PostgreSQL.
3. **Build & deploy pipeline.** Work is dispatched onto RabbitMQ queues. Dedicated workers handle each stage of the pipeline asynchronously: repository sync → build strategy detection → Docker image build → container run → domain provisioning.
4. **Routing.** Once a container is healthy, RenderLite assigns it a subdomain (e.g. `my-service.renderlite.local`) and updates the reverse-proxy configuration so external traffic resolves to the right container.

The whole flow is designed to be resumable and observable: each stage writes status transitions and logs back to the database, so the dashboard can show progress in real time and operators can retry failed steps without re-running successful ones.

---

## Feature Set

### Implemented today

- **GitHub OAuth login** with HTTP-only cookie sessions (`renderLite-access`, `renderLite-refresh`).
- **GitHub App integration** for fine-grained repository access via installation tokens (no long-lived user PATs).
- **Repository browser** in the dashboard with search and filtering.
- **RabbitMQ-backed job pipeline** with four durable consumers:
  - `renderlite.repo.sync.requested` — clones/updates the source.
  - `renderlite.build.requested` — runs the build strategy.
  - `renderlite.deploy.requested` — runs the resulting container.
  - `renderlite.domain.provision.requested` — wires routing.
- **Two build strategies**, selected per project:
  - **Static** — projects that ship pre-built assets.
  - **Dynamic** — projects that need a runtime container (Node, etc.).
- **Project-type detection service** that inspects the cloned repo and picks the right Dockerfile/buildpack path.
- **Polyglot worker support** — a Java worker (`apps/java-worker`) consumes from the same RabbitMQ broker, demonstrating that pipeline stages can be implemented in any language without coupling to the Node orchestrator.
- **WebSocket module** scaffolded for live deployment/log streaming.
- **Encrypted token storage** for OAuth credentials at rest.
- **Exponential-backoff retry** on transient pipeline failures.

### Planned

- Git webhook listeners for push-triggered redeploys.
- Live log streaming surfaced in the dashboard via the existing socket module.
- Custom domain mapping with automatic TLS.
- Deployment rollback (re-run a previous successful `Deployment` record).
- Resource quotas and concurrent-build limits per user.
- Metrics & observability dashboard.

---

## Architecture

```
                ┌────────────────────────┐
                │   Dashboard (Next.js)  │
                └───────────┬────────────┘
                            │  HTTPS (cookies)
                            ▼
                ┌────────────────────────┐
                │  API Orchestrator      │
                │  (Express + Prisma)    │
                └─────┬──────────────┬───┘
                      │              │
              publish │              │ read/write
                      ▼              ▼
              ┌──────────────┐  ┌────────────┐
              │  RabbitMQ    │  │ PostgreSQL │
              └──────┬───────┘  └────────────┘
                     │
       ┌─────────────┼─────────────┬───────────────┐
       ▼             ▼             ▼               ▼
  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐
  │  Repo   │  │  Build   │  │  Deploy  │  │   Domain     │
  │  Sync   │  │  Worker  │  │  Worker  │  │  Provision   │
  └────┬────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘
       │            │             │                │
       └────────────┼─────────────┘                │
                    ▼                              ▼
            ┌───────────────┐              ┌───────────────┐
            │ Docker Engine │              │ Reverse Proxy │
            │   (per app    │◄─────────────┤ (Nginx/Caddy) │
            │  containers)  │   routes to  └───────────────┘
            └───────────────┘
                                            user-service.renderlite.local
```

**Control plane** (API + Postgres) owns projects, deployments, and routing state.
**Data plane** (containers + reverse proxy) serves actual end-user traffic.

For a fuller breakdown of the data model, API surface, and roadmap, see [`docs/system-design.md`](docs/system-design.md).

---

## Repository Layout

This is a Turborepo monorepo managed with pnpm workspaces.

```
apps/
  ├── server         Express API + Prisma + RabbitMQ workers (the orchestrator)
  ├── web            Next.js dashboard (App Router)
  └── java-worker    Java/Maven RabbitMQ consumer (polyglot worker demo)

packages/
  ├── ui                  Shared React components
  ├── icons               Shared icon set
  ├── eslint-config       Shared ESLint config
  └── typescript-config   Shared tsconfig presets

docs/
  └── system-design.md    Current state, target architecture, and phased roadmap
```

Inside `apps/server/src/`:

- `module/auth` — GitHub OAuth callback, refresh, logout.
- `module/github_app` / `module/github_client` — GitHub App install + repo listing.
- `module/project` — project CRUD (in progress).
- `module/detect-service` — inspects a cloned repo to decide build strategy.
- `module/deploy-service` — orchestrates the deploy step.
- `module/socket` — WebSocket gateway for live updates.
- `workers/` — RabbitMQ consumers (`repository-sync`, `build`, `deploy`, `domain-provision`) plus the job publisher.

---

## Tech Stack

| Concern               | Choice                                   |
| --------------------- | ---------------------------------------- |
| Frontend              | Next.js (App Router), React, TypeScript  |
| API                   | Node.js 18+, Express, TypeScript         |
| ORM / DB              | Prisma + PostgreSQL 15                   |
| Job queue             | RabbitMQ 3.13 (management plugin)        |
| Container runtime     | Docker Engine API                        |
| Polyglot worker       | Java + Maven                             |
| Monorepo tooling      | Turborepo + pnpm workspaces              |
| Reverse proxy (planned) | Nginx / Caddy                          |

---

## Quick Start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start infrastructure

PostgreSQL and RabbitMQ run via Docker Compose:

```bash
cd apps/server
docker compose up -d
pnpm dlx prisma db push
```

RabbitMQ management UI is at `http://localhost:15672` (default credentials: `guest` / `guest`).

### 3. Configure environment

Create `apps/server/.env` with at least:

```
DATABASE_URL=postgresql://devuser:devpassword@localhost:5432/devdb
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_APP_ID=...
GITHUB_APP_PRIVATE_KEY=...
JWT_SECRET=...
ENCRYPTION_KEY=...
RABBITMQ_URL=amqp://guest:guest@localhost:5672
```

Create a GitHub OAuth App + a GitHub App, and point their callback URLs at your local dashboard (`http://localhost:3000/...`).

### 4. Run the dev servers

From the repo root:

```bash
pnpm dev
```

This starts the API and the dashboard in parallel via Turborepo. The dashboard is at `http://localhost:3000`; the API at `http://localhost:8080/api/v1`.

When the server boots, it connects to RabbitMQ and starts all four pipeline workers automatically. If RabbitMQ is unreachable, the API still serves HTTP — workers are simply paused until the broker is back.

### 5. (Optional) Run the Java worker

```bash
cd apps/java-worker/java-worker
mvn -q -DskipTests package
java -jar target/java-worker-1.0-shaded.jar
```

It consumes from `java-worker.jobs` on the same broker.

---

## Database Management

| Action            | Command                                          |
| ----------------- | ------------------------------------------------ |
| Open Prisma Studio | `pnpm dlx prisma studio`                        |
| Push schema       | `pnpm dlx prisma db push`                        |
| New migration     | `pnpm dlx prisma migrate dev --name <name>`      |
| Reset database    | `docker compose down -v` (destroys volumes)      |

---

## Engineering Decisions

### Why a queue instead of in-process orchestration?

Builds are long-running and failure-prone. Routing them through RabbitMQ means:

- the API never blocks on a build,
- each stage is independently retryable with exponential backoff,
- workers can scale horizontally,
- a single broker lets workers be written in any language (hence the Java worker).

### Why split build strategies (static vs dynamic)?

Static sites don't need a runtime container — they just need their build output uploaded behind the proxy. Dynamic apps need a long-lived container. Treating these as two pipelines instead of one keeps each path simple and avoids dragging Docker runtime concerns into static deploys.

### Why a GitHub App in addition to OAuth?

OAuth identifies the user. The GitHub App provides short-lived, fine-grained installation tokens scoped only to the repositories the user explicitly granted — closer to how production PaaS providers handle source access, and avoids storing long-lived user PATs.

### Why Turborepo?

Cached builds, shared TypeScript/ESLint config, and a single `pnpm dev` to bring up the whole stack. Frontend and backend can share types as the project grows.

---

## Roadmap

See [`docs/system-design.md`](docs/system-design.md) for the phased plan. Short version:

- **Phase 0** — stabilize auth + GitHub App install flow.
- **Phase 1** — full `Project` / `Service` CRUD wired into the dashboard's import button.
- **Phase 2** — end-to-end deploy: clone → build → run, with status + logs persisted.
- **Phase 3** — reverse-proxy routing and live log streaming in the dashboard.
- **Beyond** — webhooks, custom domains, rollbacks, observability.

---

## Why This Project Exists

RenderLite is a deliberate deep-dive into the parts of a PaaS that are usually invisible: how Git pushes become running containers, how a control plane stays consistent with a data plane, how queues turn a fragile sequential pipeline into a resilient one, and how a reverse proxy maps human-friendly hostnames onto ephemeral container IPs. The goal isn't feature parity with Render — it's understanding the tradeoffs well enough to make the same calls yourself.

---

## License

MIT
