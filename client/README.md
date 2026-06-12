# Client

A UI app built with React, Vite, and Radix Themes, talking to the provided API.

## Requirements

- Node 24. There is a `.nvmrc`, so if you use nvm just run `nvm use` in this folder.
- pnpm 11. If you do not have it, the easiest way is Corepack, which ships with Node:

  ```bash
  corepack enable
  ```

  Corepack reads the `packageManager` field in `package.json` and uses the right pnpm version automatically. If you would rather install it directly:

  ```bash
  npm install -g pnpm
  ```

## Setup

The app expects the API to be running. Start it first, from the repo root:

```bash
cd server
npm install
npm run api
```

That serves the API on port 3002. Then, in a second terminal:

```bash
cd client
nvm use
pnpm install
pnpm dev
```

The app runs on http://localhost:5173. Vite proxies `/api` to the API on port 3002, so the app calls relative paths like `/api/users` and there is no CORS or hardcoded host to worry about.

## Scripts

- `pnpm dev` runs the dev server.
- `pnpm build` type checks and builds for production.
- `pnpm preview` serves the production build.
- `pnpm test` runs the test suite once. `pnpm test:watch` keeps it running.
- `pnpm lint` runs ESLint. `pnpm format` runs Prettier.
- `pnpm typecheck` runs the TypeScript compiler with no emit.

A pre-commit hook formats and lints staged files. A pre-push hook runs type check, lint, and tests.

## Stack and why

- **Vite** for a fast dev server and build.
- **Radix Themes** for accessible, prebuilt components.
- **TanStack Query** for data fetching, caching, and retries.
- **React Router** for managing the state in the URL.
- **react-hook-form with Zod** for forms and validation.
- **Vitest with Testing Library and vitest-axe** for unit tests and accessibility checks.
- **ESLint, Prettier, and jsx-a11y** for code consistency and preventing accessibility issues.
- **dayjs** for easy date formatting.
- **lodash.debounce** for preventing race conditions and API hammering.
- **@radix-ui/react-icons** for the row actions kebab glyph.

## Users tab

The Users tab lists users from `/api/users` with their avatar, name, role, and
join date. Role names are resolved client-side from `/api/roles` (the user
record only carries a `roleId`); a single roles request is shared with the Roles
tab via the query cache.

Each row has a kebab **Actions** menu with **Edit user** and **Delete user**
(destructive) items. These are intentionally **disabled** for now — the
controls are scaffolded ahead of the behavior, which lands in a later slice.
