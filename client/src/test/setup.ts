import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, expect } from "vitest";
import * as axeMatchers from "vitest-axe/matchers";
import { server } from "./server";

// Register the axe matcher (`toHaveNoViolations`). vitest-axe only augments the
// legacy `Vi` namespace for types, so the modern typing lives in
// src/vitest-axe.d.ts. RTL auto-cleanup is enabled via `globals: true`.
expect.extend(axeMatchers);

// jsdom doesn't implement ResizeObserver, which Radix's scroll-area (used by
// DropdownMenu.Content) instantiates on mount. A no-op stub is enough for tests.
class ResizeObserverStub implements ResizeObserver {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}
globalThis.ResizeObserver = ResizeObserverStub;

// jsdom doesn't implement the Pointer Capture API, which Radix's Toast swipe
// handling probes on pointer events. No-op stubs keep those handlers from
// throwing during user-event interactions.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.setPointerCapture = () => {};
  Element.prototype.releasePointerCapture = () => {};
}

// MSW is the network seam for every test. Fail on any unhandled request so a
// missing handler surfaces loudly instead of silently hitting the real (flaky)
// backend, and reset per-test overrides between tests.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
