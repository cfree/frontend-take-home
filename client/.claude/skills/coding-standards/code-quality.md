# Code quality

TypeScript, lint, formatting, and the git hooks that gate them.

## Rules

1. **Zero lint warnings and type errors.** `pnpm typecheck` and `pnpm lint` must be clean before committing — including pre-existing issues in files you touch. CI/hooks fail on any warning or error; don't leave them for later.
2. **No `any`.** Use precise types, or `unknown` with narrowing. Don't bypass types with unsafe casts.
3. **No suppression comments.** Don't add `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, or `@ts-nocheck` (including inline JSX variants). Fix the root cause; only suppress if the user explicitly approves it.
4. **Type-only imports.** Use `import type { Foo }` for types.
5. **Format with Prettier.** `pnpm format` (or let the pre-commit hook do it). Match the surrounding style.
6. **Don't edit tooling config.** `eslint.config.js`, `.prettierrc.json`, `tsconfig.*`, `vite.config.ts`, and `pnpm-lock.yaml` are off-limits (blocked by settings) unless the user explicitly asks.

## How it's enforced

- **PostToolUse hooks** auto-run `pnpm lint` after any Edit/Write and `pnpm typecheck` after an Edit — so failures surface immediately as you work.
- **Pre-commit** (`lint-staged`): `eslint --fix` + `prettier --write` on staged files.
- **Pre-push:** `pnpm typecheck`, `pnpm lint`, and `pnpm test` — all must pass.

## Before you commit

```bash
pnpm typecheck && pnpm lint && pnpm test
```
