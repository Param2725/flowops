# FlowOps

A smart API gateway that rate-limits traffic, balances load, rolls out versions
gradually and survives upstream failures. It includes a live dashboard, structured
JSON logs with correlation IDs and a decision log.

> Status: Phase 0 (foundation). This README grows with each phase.

## Tech stack

- **Frontend:** React (Vite), Tailwind CSS, React Router
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **Tooling:** npm workspaces, ESLint, Prettier, GitHub Actions, Docker Compose

## Project structure

```
flowops/
  gateway/          API gateway: proxy, rate limiting, load balancing, circuit breaker
  control-plane/    Auth, users, plans, API keys, routes, logs API
  demo-upstream/    Sample app used as the gateway's upstream
  frontend/         React dashboard
  packages/common/  Shared constants, errors, logger, correlation IDs
  docs/             Design notes and decision records
  tests/            Postman collections and integration tests
```

## Prerequisites

- Node.js 20 or higher
- Docker Desktop (for local MongoDB)

## Install and run

```bash
git clone https://github.com/Param2725/flowops.git
cd flowops
npm install
cp .env.example .env
docker compose up -d mongo
npm run dev -w frontend
```

## Scripts

| Command                   | What it does                  |
| ------------------------- | ----------------------------- |
| `npm run lint`            | Lint all backend code         |
| `npm run format:check`    | Check formatting              |
| `npm test`                | Run tests in all workspaces   |
| `npm run dev -w frontend` | Start the frontend dev server |

## Environment variables

See `.env.example`. Never commit `.env`.

## API endpoints

Added as they are built (Phase 1 onward).

## Deployment

Added in Phase 6.
