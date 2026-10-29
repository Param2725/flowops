# Decision log

Short records of design choices and the reason for each.

## 001: Monorepo with npm workspaces

- **Decision:** one repo for gateway, control plane, demo upstream, frontend and shared code.
- **Why:** one install, one CI pipeline, and shared code in `packages/common` with no publishing.

## 002: Node built-in test runner for backend unit tests

- **Decision:** use `node:test` instead of Jest.
- **Why:** no extra dependency, the same behavior locally and in CI.

## 003: No Redis in production

- **Decision:** rate-limit counters live in memory. Redis is only a local, optional store.
- **Why:** free-tier hosting has no free Redis. The limiter sits behind a store interface so Redis can plug in.

## 004: Token storage and API contract

- **Decision:** access token in memory, refresh token in localStorage; single resources returned as-is, lists as `{ items, page, limit, total }`, errors as `{ error: { code, message, details } }`.
- **Why:** the frontend and backend live on different domains, so httpOnly cookies are unreliable across sites. The trade-off is exposure to XSS, so the refresh token is rotated and the app avoids rendering unsanitised HTML.
