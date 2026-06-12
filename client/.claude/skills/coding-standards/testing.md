# Testing

Vitest + Testing Library + MSW, jsdom environment (configured in `vite.config.ts`, setup in `src/test/setup.ts`).

## Rules

1. **Test new features.** Co-locate a `*.test.tsx` next to the code and drive the UI the way a user would (Testing Library queries by role/label, `user-event` for interaction) — not by poking internals.
2. **Mock the API with MSW.** Use the shared server and handlers (`src/test/server.ts`, `src/test/handlers.ts`) and the `fixtures.ts` data. Override handlers per-test to simulate errors/empty responses.
3. **Use the retry-disabled client.** Render through the helper in `src/test/utils.tsx`, which builds a `QueryClient` with retries off, so error-state tests fail fast instead of waiting on backoff.
4. **Cover the real paths.** For any query-backed view, assert **loading → success**, **error**, and **empty** behavior — the same three states the UI must render (see frontend.md).
5. **Include an axe assertion** (`vitest-axe`) for UI (see accessibility.md).

## Commands

```bash
pnpm test         # one-shot (vitest run)
pnpm test:watch   # watch mode
```

The pre-push hook runs the full suite; it must pass before pushing.
