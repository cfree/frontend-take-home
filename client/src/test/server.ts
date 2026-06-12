import { setupServer } from "msw/node";
import { handlers } from "./handlers";

// The MSW request-interception server used as the network seam in tests. Wired
// into the test lifecycle in src/test/setup.ts.
export const server = setupServer(...handlers);
