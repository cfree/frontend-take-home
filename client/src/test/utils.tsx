import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { Theme } from "@radix-ui/themes";

import { ToastProvider } from "~/components/toast/ToastProvider";

// A fresh client per render with retries disabled, so error-state tests fail
// fast instead of waiting on React Query's backoff.
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

type ProviderOptions = Omit<RenderOptions, "wrapper"> & {
  // Initial URL the in-memory router lands on, so routed components (and
  // deep-link / redirect behavior) can be exercised in tests.
  route?: string;
};

// Render a component wrapped in the app's providers: the Radix theme, a no-retry
// React Query client, and an in-memory router so components using routing hooks
// render in isolation.
export function renderWithProviders(
  ui: ReactElement,
  { route = "/", ...options }: ProviderOptions = {},
) {
  function AllProviders({ children }: { children: ReactNode }) {
    return (
      <Theme>
        <ToastProvider>
          <QueryClientProvider client={createTestQueryClient()}>
            <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
          </QueryClientProvider>
        </ToastProvider>
      </Theme>
    );
  }

  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
