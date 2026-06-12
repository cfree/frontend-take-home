import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { BrowserRouter } from "react-router";
import { Theme } from "@radix-ui/themes";

import AppRoutes from "./routes";
import { queryClient } from "./lib/queryClient";

import "@radix-ui/themes/styles.css";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./components/toast/ToastProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Theme
      appearance="light"
      accentColor="iris"
      grayColor="slate"
      radius="medium"
      scaling="100%"
    >
      <ToastProvider>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ErrorBoundary>
              <AppRoutes />
            </ErrorBoundary>
          </BrowserRouter>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </ToastProvider>
    </Theme>
  </StrictMode>,
);
