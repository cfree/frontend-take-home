import { axe } from "vitest-axe";
import userEvent from "@testing-library/user-event";
import AppRoutes from "./routes";
import { renderWithProviders, screen } from "./test/utils";

describe("admin routing", () => {
  it("renders a tab strip with Users and Roles tabs", () => {
    renderWithProviders(<AppRoutes />, { route: "/users" });

    // Radix TabNav renders the label twice (a visible span + a CSS-hidden
    // width-reservation span). jsdom ignores CSS, so the computed accessible
    // name is doubled ("UsersUsers"); match on a substring rather than exact.
    expect(screen.getByRole("link", { name: /Users/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Roles/ })).toBeInTheDocument();
  });

  it("marks the tab matching the current URL as active", () => {
    renderWithProviders(<AppRoutes />, { route: "/roles" });

    expect(
      screen.getByRole("link", { name: /Roles/, current: "page" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Users/ })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("redirects the admin root to the Users tab", () => {
    renderWithProviders(<AppRoutes />, { route: "/" });

    expect(
      screen.getByRole("link", { name: /Users/, current: "page" }),
    ).toBeInTheDocument();
  });

  it("navigates between tabs via keyboard, updating the active tab", async () => {
    const user = userEvent.setup();
    renderWithProviders(<AppRoutes />, { route: "/users" });

    await user.tab();
    expect(screen.getByRole("link", { name: /Users/ })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    await user.keyboard("{Enter}");

    expect(
      await screen.findByRole("link", { name: /Roles/, current: "page" }),
    ).toBeInTheDocument();
  });

  it("renders the Users screen in the layout outlet", () => {
    renderWithProviders(<AppRoutes />, { route: "/users" });

    // The search toolbar is distinctive to the Users screen, so finding it
    // confirms that route rendered into the outlet.
    expect(
      screen.getByRole("searchbox", { name: /search users/i }),
    ).toBeInTheDocument();
  });

  it("renders the Roles screen in the layout outlet", () => {
    renderWithProviders(<AppRoutes />, { route: "/roles" });

    // The roles table's loading status is distinctive to the Roles screen (the
    // Users screen has none), so finding it confirms that route rendered into
    // the outlet. It's present synchronously on the first, still-pending render.
    expect(
      screen.getByRole("status", { name: /loading roles/i }),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderWithProviders(<AppRoutes />, {
      route: "/users",
    });

    expect(await axe(container)).toHaveNoViolations();
  });
});
