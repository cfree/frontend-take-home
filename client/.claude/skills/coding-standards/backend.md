# Backend / API boundary

The backend is **provided and fixed**. You write the client against it; you do not change it.

## Rules

1. **Never modify `server/`.** It's reference-only. Editing it is out of scope and blocked by settings (`Edit(/server)` is denied). If the API seems wrong, adapt the client — don't patch the server.
2. **Treat the API as flaky.** It injects **intentional latency and random 500s**. Every consumer must tolerate slowness and failure (retries via React Query, explicit error UI — see frontend.md).
3. **Don't assume an endpoint's shape — validate it.** Mirror `server/src/models/*` with a Zod schema and parse responses (see frontend.md).

## What the API is (reference)

- **Express + tsx on `:3002`**, CORS-enabled. The Vite dev server proxies `/api/*` → `:3002`, stripping the `/api` prefix, so app code fetches same-origin relative paths (no hard-coded host).
- **Full CRUD for users and roles** — you won't need every endpoint. Models live in `server/src/models/` (`user.ts`, `paged-data.ts`, etc.).
- **Users are paged** and support a **server-side `search`** over first + last name.
- **Latency knob:** `SERVER_SPEED=slow|instant npm run api` when you need to exercise slow or instant responses.

## Commands (run from repo root)

```bash
cd server && npm install && npm run api   # start the API on :3002
cd server && npm run test                 # backend tests (reference; don't change them)
```
