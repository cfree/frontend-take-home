import type { ReactElement, ReactNode } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Theme } from "@radix-ui/themes";

// A fresh client per render with retries disabled, so error-state tests fail
// fast instead of waiting on React Query's backoff.
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

function AllProviders({ children }: { children: ReactNode }) {
  return (
    <Theme>
      <QueryClientProvider client={createTestQueryClient()}>
        {children}
      </QueryClientProvider>
    </Theme>
  );
}

// Render a component wrapped in the app's providers. Add a router wrapper here
// once components start using React Router hooks.
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from "@testing-library/react";
