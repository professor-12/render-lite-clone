# 🚀 RenderLite — Self-Hosted PaaS Platform

> A production-inspired Platform-as-a-Service (PaaS) built to replicate core deployment workflows of modern cloud platforms.

RenderLite is a container-native hosting platform that automates Git-based deployments, Docker builds, service isolation, and dynamic routing — built from scratch to deeply understand infrastructure engineering.

---

## ✨ Highlights

- 🔁 Git-based automated deployments
- 🐳 Dynamic Docker build pipeline
- 🌐 Automatic subdomain routing
- 📦 Container isolation per service
- 🧠 Monorepo architecture with Turborepo
- ⚡ Type-safe backend using Prisma ORM
- 🧪 CI-ready structure with task caching

---

## 🏗 Architecture Overview

```
                        ┌──────────────┐
                        │  Dashboard   │ (Next.js)
                        └───────┬──────┘
                                │
                                ▼
                      ┌──────────────────┐
                      │  API Orchestrator │
                      │  (Node.js)        │
                      └───────┬──────────┘
                              │
                              ▼
                     ┌───────────────────┐
                     │ Docker Engine API │
                     └───────┬───────────┘
                             │
                             ▼
                 ┌────────────────────────┐
                 │ Isolated App Containers │
                 └────────────────────────┘
                             │
                             ▼
                   Reverse Proxy (Nginx/Caddy)
                             │
                             ▼
                 user-service.renderlite.dev
```

---

## 🏗 Monorepo Structure

Managed using **Turborepo** + **pnpm workspaces**.

```
apps/
  ├── web        → Next.js dashboard
  └── server     → Deployment orchestrator & API

packages/
  ├── ui         → Shared UI components
  └── config     → Shared lint + TS configs
```

---

## 🛠 Tech Stack

- **Node.js 18+**
- **Next.js**
- **Docker**
- **PostgreSQL**
- **RabbitMQ**
- **Prisma ORM**
- **Turborepo**
- **pnpm**
- **Nginx / Caddy (planned)**

---

## ⚡ Quick Start

### 1️⃣ Install Dependencies

```bash
pnpm install
```

---

### 2️⃣ Setup Infrastructure

```bash
cd apps/server
docker-compose up -d
pnpm dlx prisma db push
```

RabbitMQ Management UI:

```
http://localhost:15672
```

Default credentials:

```
guest / guest
```

### Worker Queues (RabbitMQ)

RenderLite server now boots queue consumers for:

- `renderlite.repo.sync.requested`
- `renderlite.build.requested`
- `renderlite.deploy.requested`
- `renderlite.domain.provision.requested`

Workers are started automatically when RabbitMQ is reachable on server startup.

---

### 3️⃣ Start Development

```bash
cd ../..
pnpm dev
```

Dashboard available at:

```
http://localhost:3000
```

---

## 🛰 Database Management

| Action | Command |
|--------|----------|
| Prisma Studio | `pnpm dlx prisma studio` |
| Reset Database | `docker-compose down -v` |
| New Migration | `pnpm dlx prisma migrate dev --name <name>` |

---

## 🔐 Engineering Decisions

### Container Isolation
Each deployment runs inside its own Docker container to prevent cross-service interference and ensure resource separation.

### Dynamic Dockerfile Strategy
- If `Dockerfile` exists → Use it
- If JavaScript project → Auto-generate Dockerfile
- Otherwise → Deployment fails

This mirrors real-world PaaS buildpack behavior.

### Monorepo Design
Turborepo enables:
- Cached builds
- Shared types across frontend + backend
- Faster CI pipelines
- Strict internal version control

---

## 📈 Roadmap

- [ ] Git webhook listeners for auto-deploy
- [ ] Live log streaming (WebSockets)
- [ ] Custom domain mapping
- [ ] Horizontal scaling strategy
- [ ] Background job queue for builds
- [ ] Deployment rollback system
- [ ] Metrics & observability dashboard

---

## 🎯 Why This Project Exists

RenderLite is not just a clone — it is a systems engineering deep dive.

The goal is to understand:

- How PaaS platforms work internally
- Docker orchestration
- Reverse proxy routing
- Build pipelines
- Service isolation
- Multi-tenant architecture
- Infrastructure design tradeoffs

---

## 📄 License

MIT
