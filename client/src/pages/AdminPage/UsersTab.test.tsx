import { delay, http, HttpResponse } from "msw";
import { axe } from "vitest-axe";
import userEvent from "@testing-library/user-event";

import { server } from "~/test/server";
import { buildRole, buildUser, pageOf } from "~/test/fixtures";
import { renderWithProviders, screen } from "~/test/utils";
import UsersTab from "./UsersTab";

describe("UsersTab", () => {
  it("renders a row for each user fetched from the API", async () => {
    const user = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([user]))));

    renderWithProviders(<UsersTab />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
  });

  it("resolves and shows each user's role name", async () => {
    const role = buildRole({ id: "role-1", name: "Administrator" });
    const user = buildUser({ roleId: "role-1" });
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf([user]))),
      http.get("/api/roles", () => HttpResponse.json(pageOf([role]))),
    );

    renderWithProviders(<UsersTab />);

    expect(await screen.findByText("Administrator")).toBeInTheDocument();
  });

  it("opens a row actions menu with disabled Edit and Delete items", async () => {
    const user = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([user]))));

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );

    const editItem = await screen.findByRole("menuitem", {
      name: /edit user/i,
    });
    const deleteItem = await screen.findByRole("menuitem", {
      name: /delete user/i,
    });
    expect(editItem).toHaveAttribute("aria-disabled", "true");
    expect(deleteItem).toHaveAttribute("aria-disabled", "true");
  });

  it("opens the row actions menu with the keyboard", async () => {
    const user = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([user]))));

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    screen.getByRole("button", { name: /actions for ada lovelace/i }).focus();
    await userEvent.keyboard("{Enter}");

    expect(
      await screen.findByRole("menuitem", { name: /edit user/i }),
    ).toBeInTheDocument();
  });

  it("stays in the loading state until the roles request resolves", async () => {
    const user = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf([user]))),
      http.get("/api/roles", async () => {
        await delay("infinite");
        return HttpResponse.json(pageOf([]));
      }),
    );

    renderWithProviders(<UsersTab />);

    expect(
      await screen.findByRole("status", { name: /loading/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
  });

  it("shows the error state when the roles request fails", async () => {
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf([buildUser()]))),
      http.get("/api/roles", () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<UsersTab />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows a muted dash when a user's role can't be resolved", async () => {
    const user = buildUser({ roleId: "unknown-role" });
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf([user]))),
      http.get("/api/roles", () => HttpResponse.json(pageOf([]))),
    );

    renderWithProviders(<UsersTab />);

    expect(await screen.findByText("—")).toBeInTheDocument();
  });

  it("formats each user's join date as MMM D, YYYY", async () => {
    const user = buildUser({ createdAt: "2024-08-27T12:00:00.000Z" });
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([user]))));

    renderWithProviders(<UsersTab />);

    expect(await screen.findByText("Aug 27, 2024")).toBeInTheDocument();
  });

  it("shows the user's initials as the avatar fallback when they have no photo", async () => {
    const user = buildUser({
      first: "Ada",
      last: "Lovelace",
      photo: undefined,
    });
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([user]))));

    renderWithProviders(<UsersTab />);

    expect(await screen.findByText("AL")).toBeInTheDocument();
  });

  it("shows a loading state while users are being fetched", async () => {
    server.use(
      http.get("/api/users", async () => {
        await delay("infinite");
        return HttpResponse.json(pageOf([]));
      }),
    );

    renderWithProviders(<UsersTab />);

    expect(
      await screen.findByRole("status", { name: /loading/i }),
    ).toBeInTheDocument();
  });

  it("shows an inline error state with no retry control when the request fails", async () => {
    server.use(
      http.get("/api/users", () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<UsersTab />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /retry/i }),
    ).not.toBeInTheDocument();
  });

  it("surfaces a malformed (schema-invalid) response as the error state", async () => {
    server.use(
      http.get("/api/users", () =>
        HttpResponse.json({ data: [{ id: "1" }], next: null, prev: null }),
      ),
    );

    renderWithProviders(<UsersTab />);

    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows an empty state when there are no users", async () => {
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([]))));

    renderWithProviders(<UsersTab />);

    expect(await screen.findByText(/no users/i)).toBeInTheDocument();
  });

  it("has no accessibility violations rendering the users table", async () => {
    const user = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([user]))));

    const { container } = renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations in the empty state", async () => {
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([]))));

    const { container } = renderWithProviders(<UsersTab />);
    await screen.findByText(/no users/i);

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations with the actions menu open", async () => {
    const user = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([user]))));

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");
    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await screen.findByRole("menuitem", { name: /edit user/i });

    // The menu portals to document.body; scope axe to the menu subtree so the
    // assertion is about the menu's accessibility, not page-level landmarks.
    expect(await axe(screen.getByRole("menu"))).toHaveNoViolations();
  });

  it("has no accessibility violations in the error state", async () => {
    server.use(
      http.get("/api/users", () => new HttpResponse(null, { status: 500 })),
    );

    const { container } = renderWithProviders(<UsersTab />);
    await screen.findByRole("alert");

    expect(await axe(container)).toHaveNoViolations();
  });
});
