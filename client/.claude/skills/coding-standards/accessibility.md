# Accessibility

Accessibility is an explicit evaluation criterion — treat it as a requirement, not a nice-to-have.

## Rules

1. **Keyboard operable.** Every interactive element works without a mouse: reachable in tab order, activatable with Enter/Space, with visible focus. Menus (e.g. `RowActionsMenu`) follow the expected arrow-key/escape behavior.
2. **Correct semantics.** Use real roles, labels, and ARIA. Icon-only controls (e.g. the row-actions kebab) need an accessible name. Prefer **Radix Themes / Radix primitives**, which provide correct semantics and focus management — reach for them before hand-rolling.
3. **Announce async changes.** Use a live region for results that update without a navigation (e.g. search result counts) — `ResultsAnnouncer` exists for this.
4. **Zero a11y lint warnings.** `eslint-plugin-jsx-a11y` runs in the ESLint config; warnings must be fixed, not suppressed.
5. **Ship an axe assertion.** New or changed UI gets a `vitest-axe` check in its test (see testing.md). A component without one is incomplete.

## Quick check before calling UI done

- [ ] Tab through it — every action reachable, focus visible, no trap.
- [ ] Every control has an accessible name (especially icon-only buttons).
- [ ] Dynamic results are announced.
- [ ] `pnpm lint` clean (no jsx-a11y warnings).
- [ ] An axe assertion covers the component.
