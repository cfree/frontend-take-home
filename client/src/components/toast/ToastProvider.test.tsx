import userEvent from "@testing-library/user-event";

import { axe } from "vitest-axe";

import { renderWithProviders, screen, waitFor } from "~/test/utils";
import { type ToastVariant } from "./ToastContext";
import { useToast } from "./useToast";

// A minimal in-test consumer: fires a toast when its button is clicked, so the
// toast system is exercised through its public hook the way a feature would use
// it — never by poking the provider's internal queue.
function ToastTrigger({
  variant = "success",
  message,
}: {
  variant?: ToastVariant;
  message: string;
}) {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast({ variant, message })}>
      fire {variant}
    </button>
  );
}

describe("toast system", () => {
  it("renders the message of a toast fired through the hook", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ToastTrigger message="Ada Lovelace was deleted." />);

    await user.click(screen.getByRole("button", { name: /fire/i }));

    expect(
      await screen.findByText("Ada Lovelace was deleted."),
    ).toBeInTheDocument();
  });

  it("announces toasts assertively, since they follow directly from a user action", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ToastTrigger message="Ada Lovelace was deleted." />);

    await user.click(screen.getByRole("button", { name: /fire/i }));
    await screen.findByText("Ada Lovelace was deleted.");

    expect(await screen.findByRole("status")).toHaveAttribute(
      "aria-live",
      "assertive",
    );
  });

  it("dismisses a toast when its close control is activated", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ToastTrigger message="Ada Lovelace was deleted." />);

    await user.click(screen.getByRole("button", { name: /fire/i }));
    await screen.findByText("Ada Lovelace was deleted.");

    await user.click(screen.getByRole("button", { name: /dismiss/i }));

    await waitFor(() =>
      expect(
        screen.queryByText("Ada Lovelace was deleted."),
      ).not.toBeInTheDocument(),
    );
  });

  it("distinguishes success and warning toasts by icon color", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ToastTrigger variant="success" message="saved" />
        <ToastTrigger variant="warning" message="heads up" />
      </>,
    );

    await user.click(screen.getByRole("button", { name: "fire success" }));
    await user.click(screen.getByRole("button", { name: "fire warning" }));

    const successIcon = screen
      .getByText("saved")
      .closest("li")!
      .querySelector("[data-accent-color]");
    const warningIcon = screen
      .getByText("heads up")
      .closest("li")!
      .querySelector("[data-accent-color]");

    const successColor = successIcon?.getAttribute("data-accent-color");
    const warningColor = warningIcon?.getAttribute("data-accent-color");

    expect(successColor).toBeTruthy();
    expect(warningColor).toBeTruthy();
    expect(successColor).not.toBe(warningColor);
  });

  it("has no accessibility violations with a toast visible", async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(
      <ToastTrigger message="Ada Lovelace was deleted." />,
    );

    await user.click(screen.getByRole("button", { name: /fire/i }));
    await screen.findByText("Ada Lovelace was deleted.");

    expect(await axe(container)).toHaveNoViolations();
  });
});
