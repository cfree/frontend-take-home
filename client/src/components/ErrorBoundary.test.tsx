import { axe } from "vitest-axe";
import { renderWithProviders, screen } from "~/test/utils";
import { ErrorBoundary } from "./ErrorBoundary";

function Throws(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  it("renders a fallback when a child throws during render", () => {
    renderWithProviders(
      <ErrorBoundary>
        <Throws />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it("renders its children untouched when nothing throws", () => {
    renderWithProviders(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>,
    );

    expect(screen.getByText("All good")).toBeInTheDocument();
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it("has no accessibility violations in the fallback", async () => {
    const { container } = renderWithProviders(
      <ErrorBoundary>
        <Throws />
      </ErrorBoundary>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
