import { axe } from "vitest-axe";
import App from "./App";
import { renderWithProviders, screen } from "./test/utils";

describe("App", () => {
  it("renders the app heading", () => {
    renderWithProviders(<App />);
    expect(
      screen.getByRole("heading", { name: /App Scaffolding/i }),
    ).toBeInTheDocument();
  });

  it("has no accessibility violations", async () => {
    const { container } = renderWithProviders(<App />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
