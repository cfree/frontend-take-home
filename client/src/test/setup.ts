import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";

// Register the axe matcher (`toHaveNoViolations`). vitest-axe only augments the
// legacy `Vi` namespace for types, so the modern typing lives in
// src/vitest-axe.d.ts. RTL auto-cleanup is enabled via `globals: true`.
expect.extend(axeMatchers);
