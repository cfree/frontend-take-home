import "vitest";
import type { AxeMatchers } from "vitest-axe/matchers";

// vitest-axe@0.1.0 only augments the legacy `Vi` namespace, which Vitest 4 no
// longer reads for assertion types. Re-augment the modern `vitest` module so
// `expect(...).toHaveNoViolations()` is typed. The `T = any` default must match
// Vitest's own `Assertion` declaration for the interfaces to merge.
declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Assertion<T = any> extends AxeMatchers {}
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}
