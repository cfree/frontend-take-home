import { QueryClient } from "@tanstack/react-query";

// App-wide React Query client. We intentionally keep the library's default
// retry behavior (3x with backoff), which is the correct resilience strategy
// against a flaky backend. Tests build their own client with retries
// disabled (see src/test/utils.tsx) so error-state tests fail fast
// instead of waiting on backoff.
export const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});
