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
- **Zod** for validation.
- **Vitest with Testing Library and vitest-axe** for unit tests and accessibility checks.
- **ESLint, Prettier, and jsx-a11y** for code consistency and preventing accessibility issues.
- **dayjs** for easy date formatting.
- **lodash.debounce** for preventing race conditions and API hammering.
- **@radix-ui/react-icons** for the row actions kebab glyph.

## Agentic guardrails

AI accelerated (component scaffolding, test boilerplate, repetitive MSW handlers), but I owned the architecture, the data-fetch pattern, the accessibility model, UX tradeoffs. I encoded my own standards into machine-checkable form and made the agent follow them:

- Claude settings include allow/deny permissions and hooks to prevent agents from calling tasks complete without first checking linting and type checking
- Git hooks (pre-commit formats/lints, pre-push runs typecheck + lint + tests) — AI output had to pass the same gate mine would
- `.claude/skills/coding-standards/` [custom skill](./claude/skills/coding-standards) — backend (never touch server/), Zod-validated data-fetch pattern, accessibility as a top concern, testing conventions
- Bundled select [skills from Matt Pocock](https://github.com/mattpocock/skills) I like to build with (specifically `/grill-me`, `/to-issues`, `/tdd`, and `/handoff`)

## Things I would improve/do differently

- **Pagination** — spec'd out but cut for time. Significant gap since the API returns
  10 items by default. Would use URL query params (`?page=2`) with an out-of-range
  redirect rather than a 404.
- **Loading state visual instability** — action buttons shift size during loading.
  Fix is to render them disabled during the request rather than swapping in a spinner,
  then close and show a success toast on resolve.
- **Status code mapping** — 400/404/500 logic is duplicated across mutations and
  components. A small mapper would centralize it and make error messages consistent.
- **Test coverage** — critical paths covered but not exhaustive. Would add Playwright
  for keyboard navigation and modal focus trap testing specifically.
- **i18n** — assistive tech benefits from properly localized strings. Would add
  react-i18next as a foundation.
