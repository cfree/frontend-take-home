---
name: coding-standards
description: Coding standards and conventions for the WorkOS frontend take-home client app, bucketed into backend, frontend, accessibility, testing, and code-quality references. Use whenever writing, editing, or reviewing code under client/; when the user mentions coding standards, conventions, style, or best practices; when conducting a code review; and before implementing any feature, fix, or refactor.
---

# Coding Standards (client)

The normative rules for this repo. Load the bucket(s) relevant to your task, then follow them. When standards conflict with a quick fix, the standards win — surface the tension instead of silently violating them.

## Buckets

| Bucket                     | Covers                                                                   | Read                                 |
| -------------------------- | ------------------------------------------------------------------------ | ------------------------------------ |
| **Backend / API boundary** | The fixed Express API, how to consume it, never modifying it             | [backend.md](backend.md)             |
| **Frontend / data layer**  | React 19, Radix Themes, TanStack Query, the data-fetch pattern, state/UI | [frontend.md](frontend.md)           |
| **Accessibility**          | Keyboard, focus, ARIA, jsx-a11y, axe (this is graded)                    | [accessibility.md](accessibility.md) |
| **Testing**                | Vitest + Testing Library + MSW, axe assertions                           | [testing.md](testing.md)             |
| **Code quality**           | TypeScript, lint, format, git hooks, import conventions                  | [code-quality.md](code-quality.md)   |

## Non-negotiables (read the bucket for detail)

1. **Never modify `server/`** — adapt the client to the API as-is, latency and random 500s included. → backend.md
2. **Validate every API response with Zod** — `*Schema.parse()`, mirror server models. → frontend.md
3. **All data access goes through `~/api/<domain>`** hooks built with `apiUrl()`; keys centralized in `~/lib/queryKeys`. → frontend.md
4. **Every query-backed view handles loading, error, and empty** explicitly. → frontend.md
5. **Accessibility is graded** — keyboard + ARIA, ship an axe assertion, zero a11y lint warnings. → accessibility.md
6. **Test new features** against MSW with a retry-disabled client. → testing.md
7. **Zero lint warnings and type errors** before commit; type-only imports. → code-quality.md

## Workflow: implementing a feature or change

1. Read the relevant bucket(s) — at minimum frontend.md; add accessibility.md and testing.md for any UI.
2. Follow the data-fetch pattern in frontend.md (don't invent a new fetch path).
3. Co-locate a `*.test.tsx` and cover loading / error / empty + an axe assertion (testing.md, accessibility.md).
4. Run `pnpm typecheck && pnpm lint && pnpm test` — all clean (code-quality.md).

## Workflow: conducting a review

Walk the diff against each bucket. For each finding cite the rule and the file:line. Flag:

- **Backend boundary** — any change under `server/`, or client code that assumes the API is fast/reliable. (backend.md)
- **Data layer** — unvalidated responses, ad-hoc `fetch`, hard-coded hosts, inline query keys, missing loading/error/empty. (frontend.md)
- **Accessibility** — non-keyboard-operable UI, missing labels/roles, no axe coverage. (accessibility.md)
- **Testing** — new behavior without a test, tests that don't exercise error paths. (testing.md)
- **Quality** — `any`, suppression comments, value imports for types, lint/type errors. (code-quality.md)
