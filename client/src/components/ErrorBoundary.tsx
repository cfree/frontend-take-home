import { Component, type ReactNode } from "react";
import { Callout, Container } from "@radix-ui/themes";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Last-resort safety net for unexpected render-time exceptions anywhere in the
// admin area. Routine backend failures are handled inline by each surface's own
// error state; this boundary catches real bugs (render-time crashes) so they
// degrade to a graceful message instead of a blank white page.
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <Container size="2" p="6">
          <Callout.Root color="red" role="alert">
            <Callout.Text>
              Something went wrong. Please refresh the page and try again.
            </Callout.Text>
          </Callout.Root>
        </Container>
      );
    }

    return this.props.children;
  }
}
