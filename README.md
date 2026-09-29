# Services Monorepo

A microservices platform composed of four modules — **Auth**, **Notifications**, **Dashboard** and **AI** — fronted by an **nginx API gateway**, shared infrastructure (**PostgreSQL**, **Redis**) and an observability stack (**Prometheus**, **Grafana**, **Alertmanager**).

## Architecture

```
                     ┌──────────────────────────────────────────┐
   http(s) ─────────►│  gateway (nginx)  :80 / :443            │
                     │  /api/*  → module backends               │
                     │  /socket.io/ → notification-backend      │
                     └───────┬──────────────┬───────────────────┘
                             │              │
             ┌───────────────┴───┐    ┌─────┴──────────────────┐
             │ Module backends   │    │ Module frontends       │
             │ (NestJS, :400x)   │    │ (Next.js 14, :300x)    │
             │  auth             │    │  auth      → :3000     │
             │  notification     │    │  dashboard → :3001     │
             │  dashboard        │    │  notification → :3002  │
             │  ai               │    │  ai        → :3003     │
             └───────┬───────────┘    └────────────────────────┘
                     │
        ┌────────────┴────────────┐        ┌────────────────────────┐
        │ shared/core (workspace) │        │ Postgres · Redis       │
        │ logging · metrics ·     │        │ Prometheus · Grafana   │
        │ redis · event bus       │        │ Alertmanager           │
        └─────────────────────────┘        └────────────────────────┘
```

- **Monorepo**: npm workspaces — one root `package-lock.json`.
- **Backends**: NestJS, TypeScript, class-validator DTOs, JWT auth, Socket.IO (notification module).
- **Frontends**: Next.js 14 (app router), Tailwind CSS.
- **Gateway**: nginx routing `/api/*`, WebSocket upgrade for `/socket.io/`, TLS-ready.
- **Observability**: Prometheus metrics exported per service, Grafana dashboards, Alertmanager alerting.

## Modules / ports

| Service              | Type      | Container | Host       |
| -------------------- | --------- | --------- | ---------- |
| gateway              | nginx     | 80 / 443  | 80 / 443   |
| auth-backend         | NestJS    | 4000      | (exposed)  |
| auth-frontend        | Next.js   | 3000      | 3000       |
| notification-backend | NestJS    | 4001      | (exposed)  |
| notification-frontend| Next.js   | 3000      | 3002       |
| dashboard-backend    | NestJS    | 4002      | (exposed)  |
| dashboard-frontend   | Next.js   | 3000      | 3001       |
| ai-backend           | NestJS    | 4003      | (exposed)  |
| ai-frontend          | Next.js   | 3000      | 3003       |
| postgres             | PostgreSQL| 5432      | 5432       |
| redis                | Redis     | 6379      | 6379       |
| prometheus           | —         | 9090      | 9090       |
| alertmanager         | —         | 9093      | 9094       |
| grafana              | —         | 3000      | 3004       |

## Repository layout

```
services/
├── shared/core/                 Shared logging, metrics, redis, event bus
├── auth-module/                 Register/login, JWT, email verification
│   ├── backend/                 NestJS API (PostgreSQL + Drizzle)
│   └── frontend/                Next.js auth pages
├── notification-module/         Real-time notifications (Socket.IO)
│   ├── backend/
│   └── frontend/
├── dashboard-module/            KPIs, charts, date-range filtering
│   ├── backend/
│   ├── frontend/
│   └── shared/                  Shared dashboard types
├── ai-module/                   AI chat + document summarization
│   ├── backend/
│   └── frontend/
├── nginx/                       API gateway config + cert tooling
├── monitoring/                  Prometheus, Grafana, Alertmanager config
├── docker-compose.yml           Local stack
└── docker-compose.prod.yml      Production overrides
```

## Quick start

```bash
cp .env.example .env    # then fill in the secrets (see below)
npm install
npm run docker:up       # builds and starts the whole stack
```

Then open `http://localhost` (gateway). The four frontends are also reachable directly on `:3000`/`:3001`/`:3002`/`:3003`.

Required secrets in `.env`:

| Variable                 | Used by   |
| ------------------------ | --------- |
| `POSTGRES_PASSWORD`      | postgres  |
| `REDIS_PASSWORD`         | redis     |
| `JWT_SECRET`             | auth, ai  |
| `API_KEY`                | notification-backend |
| `ANTHROPIC_API_KEY`      | ai-backend |

## Development

```bash
npm run dev              # all backends + dashboard frontend (concurrently)
npm run build            # build all backends
npm run build:frontend   # build all frontends
npm test                 # run all backend tests
npm run lint             # eslint
npm run format:check     # prettier
```

Each module has its own `package.json` script set (e.g. `npm run test --workspace @services/auth-backend`).

## CI/CD

`.github/workflows/ci.yml` runs on every push/PR to `main`:

1. **lint** — eslint + prettier check
2. **shared-core** — typecheck `@services/core`
3. **auth / notification / dashboard / ai modules** — build + test each backend (and dashboard frontend)
4. **docker-build** — builds all 9 images (8 services + gateway) using root-context multi-stage Dockerfiles

## License

[MIT](LICENSE)