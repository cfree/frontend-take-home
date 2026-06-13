import { axe } from "vitest-axe";
import { renderWithProviders, screen } from "~/test/utils";
import type { ToastVariant } from "./toast/ToastContext";
import { StatusCallout } from "./StatusCallout";

const VARIANTS: ToastVariant[] = ["error", "warning", "neutral", "success"];

describe("StatusCallout", () => {
  it("renders its message", () => {
    renderWithProviders(<StatusCallout variant="error" message="Boom" />);

    expect(screen.getByText("Boom")).toBeInTheDocument();
  });

  it("renders a distinct icon for each variant", () => {
    const iconMarkup = VARIANTS.map((variant) => {
      const { container, unmount } = renderWithProviders(
        <StatusCallout variant={variant} message="msg" />,
      );
      const svg = container.querySelector("svg");
      expect(svg).toBeInTheDocument();
      const markup = svg!.outerHTML;
      unmount();
      return markup;
    });

    // Every variant shows its own icon — no two variants share one.
    expect(new Set(iconMarkup).size).toBe(VARIANTS.length);
  });

  it("carries a distinct accent color per variant", () => {
    const colorOf = (variant: ToastVariant) => {
      const { container, unmount } = renderWithProviders(
        <StatusCallout variant={variant} message="msg" />,
      );
      // The callout root carries both its role and its accent color; scope to it
      // so the Theme wrapper's own accent color isn't what we read.
      const color = container
        .querySelector('[role="alert"], [role="status"]')
        ?.getAttribute("data-accent-color");
      unmount();
      return color;
    };

    const colors = VARIANTS.map(colorOf);
    colors.forEach((color) => expect(color).toBeTruthy());
    expect(new Set(colors).size).toBe(VARIANTS.length);
  });

  it("announces error and warning assertively via role=alert", () => {
    const { rerender } = renderWithProviders(
      <StatusCallout variant="error" message="broke" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("broke");

    rerender(<StatusCallout variant="warning" message="careful" />);
    expect(screen.getByRole("alert")).toHaveTextContent("careful");
  });

  it("announces success and neutral politely via role=status", () => {
    const { rerender } = renderWithProviders(
      <StatusCallout variant="success" message="done" />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("done");

    rerender(<StatusCallout variant="neutral" message="fyi" />);
    expect(screen.getByRole("status")).toHaveTextContent("fyi");
  });

  it("has no accessibility violations", async () => {
    const { container } = renderWithProviders(
      <StatusCallout variant="error" message="Something went wrong." />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
