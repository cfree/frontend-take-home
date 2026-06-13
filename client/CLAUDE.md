# CLAUDE.md — WorkOS Frontend Take-Home (client)

## Coding standards — read first

> **Before writing, editing, or reviewing any code, use the `coding-standards` skill**
> (`.claude/skills/coding-standards/`). It is the source of truth for _how_ to write
> code here — this file is orientation only. Buckets:
>
> - **backend.md** — the fixed Express API and how to consume it (never modify `server/`).
> - **frontend.md** — React, Radix Themes, and the Zod-validated TanStack Query data-fetch pattern.
> - **accessibility.md** — keyboard, ARIA, jsx-a11y, and axe (graded).
> - **testing.md** — Vitest + Testing Library + MSW.
> - **code-quality.md** — TypeScript, lint, formatting, and the git hooks.

## Project Overview

A two-tab admin UI listing **Users** and **Roles** with limited update functionality, built against a provided Express API (the WorkOS frontend take-home; design comes from Figma). Stack: Vite + React 19 + Radix Themes + TanStack Query + React Router 7, with Vitest/Testing Library/MSW. pnpm 11 on Node 24.

- **`client/`** — the React app; where all the work happens.
- **`server/`** — the provided backend API. **Do not alter it** (see backend.md).

## Getting started

`pnpm test` / `pnpm lint` / `pnpm typecheck` gate the code; see the `coding-standards` skill for when and how.

## Agent skills

### Issue tracker

Issues and PRDs are tracked as GitHub issues on `cfree/frontend-take-home` (the `origin` fork), via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Canonical triage labels (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`) map 1:1 to their default names. See `docs/agents/triage-labels.md`.

### Domain docs

`docs/adr/` at the `client/` root. See `docs/agents/domain.md`.
