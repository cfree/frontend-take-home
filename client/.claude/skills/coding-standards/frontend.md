# Frontend / data layer

React 19 + Radix Themes, data via TanStack Query, routing via React Router 7. Validation at every boundary.

## Stack conventions

- **UI: Radix Themes.** Prefer its accessible primitives over hand-rolled components. Theme is configured in `src/main.tsx`.
- **Routing: React Router 7.** Route tree in `src/routes.tsx`. The URL holds tab + search state — read state from the URL, don't shadow it in local component state.
- **Forms: react-hook-form + Zod** via `@hookform/resolvers`.
- **Import alias `~` → `./src`** (see `vite.config.ts`). Use it for cross-area imports; relative paths are fine within a folder.

## The data-fetch pattern (don't invent another)

Types flow from the server model to the UI, validated at the boundary:

```
Express API (:3002) → fetch via apiUrl() → Zod schema.parse() → typed hook (useUsers/useRoles) → React Query cache → component
```

1. **Validate every response with Zod.** Define the schema in `src/api/<domain>/types.ts` mirroring `server/src/models/*`; `z.infer<>` gives the TS type. The fetch helper does `schema.parse(await res.json())` and throws on a non-OK status or shape mismatch, so a bad payload surfaces as the query's error state rather than a downstream crash.
2. **All data access goes through `~/api/<domain>`** — a typed `useQuery`/`useMutation` hook plus its `types.ts`. No ad-hoc `fetch` in components.
3. **Build URLs with `apiUrl()`** (`src/api/lib/apiUrl.ts`). Never hard-code a host; the dev proxy keeps requests same-origin, and `apiUrl()` produces absolute URLs that also work under jsdom in tests.
4. **Centralize query keys** in `src/lib/queryKeys.ts` so caching, dedup, and invalidation stay consistent. Fold scoping params into the key (e.g. search term) so each variant is its own cache entry.
5. **The paged envelope** is built once via `pagedSchema()` (`src/api/lib/pagedData.ts`) — reuse it, don't redefine `PagedData<T>`.
6. **Derive with `select`, memoized.** For data computed from a query (e.g. a `roleId → name` map), use React Query's `select` with a **module-level** selector function so the reference is stable and the cache dedupes — no extra request (see `useRolesMap`).

## Loading, error, and empty states (required)

Every query-backed view handles all three, explicitly and distinctly:

- **Loading** → a skeleton (`UsersTableSkeleton`), not a bare spinner.
- **Error** → `ErrorState`; render-time crashes are caught by `ErrorBoundary`.
- **Empty** → `EmptyState` (e.g. a search with no matches) — distinct from loading and error.

Retries are intentional: the app-wide client keeps React Query's default 3× backoff (`src/lib/queryClient.ts`) as resilience against the flaky API. Don't disable it in app code (tests are the exception — see testing.md).

## Other shared building blocks

`SearchInput`, `RowActionsMenu`, `UserCell`, `ResultsAnnouncer`, and `useDebouncedCallback` already exist — reuse them before writing new equivalents. Debounce user-driven fetches (e.g. search) to avoid hammering the API and racing responses.
