import { delay, http, HttpResponse } from "msw";
import { axe } from "vitest-axe";
import userEvent from "@testing-library/user-event";

import { server } from "~/test/server";
import { buildRole, buildUser, pageOf } from "~/test/fixtures";
import { renderWithProviders, screen, waitFor, within } from "~/test/utils";
import AppRoutes from "~/routes";
import RolesTab from "./RolesTab";

describe("RolesTab", () => {
  it("renders a row for each role fetched from the API", async () => {
    const roles = [
      buildRole({ name: "Administrator" }),
      buildRole({ name: "Member" }),
    ];
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf(roles))));

    renderWithProviders(<RolesTab />);

    expect(await screen.findByText("Administrator")).toBeInTheDocument();
    expect(screen.getByText("Member")).toBeInTheDocument();
  });

  it("shows a role's description stacked beneath its name when present", async () => {
    const role = buildRole({
      name: "Administrator",
      description: "Full access to everything",
    });
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf([role]))));

    renderWithProviders(<RolesTab />);

    expect(await screen.findByText("Administrator")).toBeInTheDocument();
    expect(screen.getByText("Full access to everything")).toBeInTheDocument();
  });

  it("omits the description line entirely when a role has none", async () => {
    const role = buildRole({ name: "Member", description: undefined });
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf([role]))));

    renderWithProviders(<RolesTab />);

    expect(await screen.findByText("Member")).toBeInTheDocument();
    // No em-dash / placeholder stands in for an absent description.
    expect(screen.queryByText("—")).not.toBeInTheDocument();
  });

  it("shows a Default badge only on roles where isDefault is true", async () => {
    const roles = [
      buildRole({ name: "Administrator", isDefault: true }),
      buildRole({ name: "Member", isDefault: false }),
    ];
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf(roles))));

    renderWithProviders(<RolesTab />);

    await screen.findByText("Administrator");
    // The badge sits in the Administrator row, and the Member row has none.
    const rowFor = (name: string) =>
      within(screen.getByText(name).closest("tr") as HTMLElement);
    expect(rowFor("Administrator").getByText("Default")).toBeInTheDocument();
    expect(rowFor("Member").queryByText("Default")).not.toBeInTheDocument();
  });

  it("renders a Default badge per default role, not assuming a single one", async () => {
    const roles = [
      buildRole({ name: "Administrator", isDefault: true }),
      buildRole({ name: "Owner", isDefault: true }),
      buildRole({ name: "Member", isDefault: false }),
    ];
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf(roles))));

    renderWithProviders(<RolesTab />);

    await screen.findByText("Administrator");
    const rowFor = (name: string) =>
      within(screen.getByText(name).closest("tr") as HTMLElement);
    expect(rowFor("Administrator").getByText("Default")).toBeInTheDocument();
    expect(rowFor("Owner").getByText("Default")).toBeInTheDocument();
    expect(rowFor("Member").queryByText("Default")).not.toBeInTheDocument();
  });

  it("shows a loading skeleton with an accessible status label while fetching", async () => {
    server.use(
      http.get("/api/roles", async () => {
        await delay("infinite");
        return HttpResponse.json(pageOf([]));
      }),
    );

    renderWithProviders(<RolesTab />);

    expect(
      await screen.findByRole("status", { name: /loading roles/i }),
    ).toBeInTheDocument();
  });

  it("shows an empty state when there are no roles", async () => {
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf([]))));

    renderWithProviders(<RolesTab />);

    expect(await screen.findByText("No roles found.")).toBeInTheDocument();
  });

  it("shows an inline error state when the roles request fails", async () => {
    server.use(
      http.get("/api/roles", () => new HttpResponse(null, { status: 500 })),
    );

    renderWithProviders(<RolesTab />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "We couldn't load roles. Please try again.",
    );
  });

  it("has no accessibility violations rendering the roles table", async () => {
    const roles = [
      buildRole({
        name: "Administrator",
        description: "Full access",
        isDefault: true,
      }),
      buildRole({ name: "Member", description: undefined }),
    ];
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf(roles))));

    const { container } = renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations in the empty state", async () => {
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf([]))));

    const { container } = renderWithProviders(<RolesTab />);
    await screen.findByText("No roles found.");

    expect(await axe(container)).toHaveNoViolations();
  });

  it("has no accessibility violations in the error state", async () => {
    server.use(
      http.get("/api/roles", () => new HttpResponse(null, { status: 500 })),
    );

    const { container } = renderWithProviders(<RolesTab />);
    await screen.findByRole("alert");

    expect(await axe(container)).toHaveNoViolations();
  });
});

describe("RolesTab rename", () => {
  it("offers a Rename role action in each row's actions menu", async () => {
    const role = buildRole({ name: "Administrator" });
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf([role]))));

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for administrator/i }),
    );

    expect(
      await screen.findByRole("menuitem", { name: /rename role/i }),
    ).toBeInTheDocument();
  });

  // Open the rename dialog for the named role and return the dialog element.
  async function openRenameDialog(roleName: string) {
    await userEvent.click(
      screen.getByRole("button", {
        name: new RegExp(`actions for ${roleName}`, "i"),
      }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /rename role/i }),
    );
    return screen.findByRole("dialog");
  }

  it("opens a labeled rename dialog pre-filled with the current name, text selected", async () => {
    const role = buildRole({ name: "Administrator" });
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf([role]))));

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    const dialog = await openRenameDialog("Administrator");
    // The dialog is labelled by its title (the submit button also reads
    // "Rename role", so assert the accessible name rather than matching text).
    expect(dialog).toHaveAccessibleName("Rename role");
    expect(
      within(dialog).getByText("Change the role name."),
    ).toBeInTheDocument();

    const field = within(dialog).getByRole("textbox", { name: /role name/i });
    expect(field).toHaveValue("Administrator");
    // Text is pre-selected so the user can immediately overwrite it.
    const input = field as HTMLInputElement;
    expect(input.selectionStart).toBe(0);
    expect(input.selectionEnd).toBe("Administrator".length);
  });

  it("renames the role on submit: PATCHes, closes the dialog, toasts, and updates the row", async () => {
    let roles = [buildRole({ id: "role-1", name: "Administrator" })];
    let patchedBody: { name?: string } | null = null;
    server.use(
      http.get("/api/roles", () => HttpResponse.json(pageOf(roles))),
      http.patch("/api/roles/:id", async ({ request }) => {
        patchedBody = (await request.json()) as { name?: string };
        roles = roles.map((r) =>
          r.id === "role-1" ? { ...r, name: patchedBody!.name! } : r,
        );
        return HttpResponse.json(roles[0]);
      }),
    );

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    const dialog = await openRenameDialog("Administrator");
    const field = within(dialog).getByRole("textbox", { name: /role name/i });
    await userEvent.clear(field);
    await userEvent.type(field, "Admins");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^rename role$/i }),
    );

    // The request carried only the new name.
    await waitFor(() => expect(patchedBody).toEqual({ name: "Admins" }));
    // Success toast names the new value.
    expect(
      await screen.findByText('Role renamed to "Admins".'),
    ).toBeInTheDocument();
    // Dialog closes and the row reflects the new name after the cache refetches.
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(await screen.findByText("Admins")).toBeInTheDocument();
  });

  it("submits the rename when Enter is pressed in the field", async () => {
    const roles = [buildRole({ id: "role-1", name: "Administrator" })];
    let patchedBody: { name?: string } | null = null;
    server.use(
      http.get("/api/roles", () => HttpResponse.json(pageOf(roles))),
      http.patch("/api/roles/:id", async ({ request }) => {
        patchedBody = (await request.json()) as { name?: string };
        return HttpResponse.json({ ...roles[0], name: patchedBody!.name! });
      }),
    );

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    const dialog = await openRenameDialog("Administrator");
    const field = within(dialog).getByRole("textbox", { name: /role name/i });
    await userEvent.clear(field);
    await userEvent.type(field, "Admins{Enter}");

    await waitFor(() => expect(patchedBody).toEqual({ name: "Admins" }));
  });

  it("keeps Rename unavailable until the name is a non-empty change", async () => {
    const role = buildRole({ name: "Administrator" });
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf([role]))));

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    const dialog = await openRenameDialog("Administrator");
    const renameBtn = within(dialog).getByRole("button", {
      name: /^rename role$/i,
    });
    const field = within(dialog).getByRole("textbox", { name: /role name/i });

    // Unchanged on open.
    expect(renameBtn).toHaveAttribute("aria-disabled", "true");
    // Empty.
    await userEvent.clear(field);
    expect(renameBtn).toHaveAttribute("aria-disabled", "true");
    // Whitespace-only.
    await userEvent.type(field, "   ");
    expect(renameBtn).toHaveAttribute("aria-disabled", "true");
    // The same name again.
    await userEvent.clear(field);
    await userEvent.type(field, "Administrator");
    expect(renameBtn).toHaveAttribute("aria-disabled", "true");
    // A genuine change unlocks it.
    await userEvent.type(field, " v2");
    expect(renameBtn).not.toHaveAttribute("aria-disabled", "true");
  });

  it("visually distinguishes the gated Rename button, including after reverting the name", async () => {
    const role = buildRole({ name: "Administrator" });
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf([role]))));

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    const dialog = await openRenameDialog("Administrator");
    const renameBtn = within(dialog).getByRole("button", {
      name: /^rename role$/i,
    });
    const field = within(dialog).getByRole("textbox", { name: /role name/i });

    // Unchanged on open: the button reads as disabled, not active.
    expect(renameBtn).toHaveStyle({ cursor: "not-allowed" });

    // A genuine change makes it read as active.
    await userEvent.type(field, " v2");
    expect(renameBtn).not.toHaveStyle({ cursor: "not-allowed" });

    // Reverting to the original name returns it to the disabled appearance.
    await userEvent.clear(field);
    await userEvent.type(field, "Administrator");
    expect(renameBtn).toHaveStyle({ cursor: "not-allowed" });
  });

  it("presents a busy state and blocks dismissal and double-submit while in flight", async () => {
    const role = buildRole({ name: "Administrator" });
    let patchCount = 0;
    server.use(
      http.get("/api/roles", () => HttpResponse.json(pageOf([role]))),
      http.patch("/api/roles/:id", async () => {
        patchCount++;
        await delay("infinite");
        return HttpResponse.json(role);
      }),
    );

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    const dialog = await openRenameDialog("Administrator");
    const field = within(dialog).getByRole("textbox", { name: /role name/i });
    const renameBtn = within(dialog).getByRole("button", {
      name: /^rename role$/i,
    });
    await userEvent.clear(field);
    await userEvent.type(field, "Admins");
    await userEvent.click(renameBtn);

    // Both buttons present a busy/disabled state via aria (not native disabled).
    await waitFor(() => expect(renameBtn).toHaveAttribute("aria-busy", "true"));
    expect(renameBtn).toHaveAttribute("aria-disabled", "true");
    expect(
      within(dialog).getByRole("button", { name: /cancel/i }),
    ).toHaveAttribute("aria-disabled", "true");

    // The dialog can't be dismissed mid-request.
    await userEvent.keyboard("{Escape}");
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // A second submit while in flight does not fire a second request.
    await userEvent.click(renameBtn);
    expect(patchCount).toBe(1);
  });

  it("shows a specific inline error and stays open when the name is a duplicate (400)", async () => {
    const role = buildRole({ name: "Administrator" });
    server.use(
      http.get("/api/roles", () => HttpResponse.json(pageOf([role]))),
      http.patch("/api/roles/:id", () =>
        HttpResponse.json(
          { message: "Role with given name already exists" },
          { status: 400 },
        ),
      ),
    );

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    const dialog = await openRenameDialog("Administrator");
    const field = within(dialog).getByRole("textbox", { name: /role name/i });
    await userEvent.clear(field);
    await userEvent.type(field, "Member");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^rename role$/i }),
    );

    // Specific, name-bearing error, keyed off the 400 status; dialog stays open.
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "A role named 'Member' already exists.",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows a generic inline error and stays open on other failures (500)", async () => {
    const role = buildRole({ name: "Administrator" });
    server.use(
      http.get("/api/roles", () => HttpResponse.json(pageOf([role]))),
      http.patch(
        "/api/roles/:id",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    const dialog = await openRenameDialog("Administrator");
    const field = within(dialog).getByRole("textbox", { name: /role name/i });
    await userEvent.clear(field);
    await userEvent.type(field, "Member");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^rename role$/i }),
    );

    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again.",
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("returns focus to the row's kebab trigger when the dialog is cancelled", async () => {
    const role = buildRole({ name: "Administrator" });
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf([role]))));

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    const trigger = screen.getByRole("button", {
      name: /actions for administrator/i,
    });
    const dialog = await openRenameDialog("Administrator");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /cancel/i }),
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("returns focus to the row's kebab trigger after a successful rename", async () => {
    let roles = [buildRole({ id: "role-1", name: "Administrator" })];
    server.use(
      http.get("/api/roles", () => HttpResponse.json(pageOf(roles))),
      http.patch("/api/roles/:id", async ({ request }) => {
        const body = (await request.json()) as { name: string };
        roles = roles.map((r) =>
          r.id === "role-1" ? { ...r, name: body.name } : r,
        );
        return HttpResponse.json(roles[0]);
      }),
    );

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    const trigger = screen.getByRole("button", {
      name: /actions for administrator/i,
    });
    const dialog = await openRenameDialog("Administrator");
    const field = within(dialog).getByRole("textbox", { name: /role name/i });
    await userEvent.clear(field);
    await userEvent.type(field, "Admins");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^rename role$/i }),
    );

    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("reflects the renamed role in the Users tab's Role column via the shared cache", async () => {
    let roles = [buildRole({ id: "role-1", name: "Administrator" })];
    const user = buildUser({
      first: "Ada",
      last: "Lovelace",
      roleId: "role-1",
    });
    server.use(
      http.get("/api/roles", () => HttpResponse.json(pageOf(roles))),
      http.get("/api/users", () => HttpResponse.json(pageOf([user]))),
      http.patch("/api/roles/:id", async ({ request }) => {
        const body = (await request.json()) as { name: string };
        roles = roles.map((r) =>
          r.id === "role-1" ? { ...r, name: body.name } : r,
        );
        return HttpResponse.json(roles[0]);
      }),
    );

    renderWithProviders(<AppRoutes />, { route: "/roles" });
    await screen.findByText("Administrator");

    const dialog = await openRenameDialog("Administrator");
    const field = within(dialog).getByRole("textbox", { name: /role name/i });
    await userEvent.clear(field);
    await userEvent.type(field, "Admins");
    await userEvent.click(
      within(dialog).getByRole("button", { name: /^rename role$/i }),
    );
    await screen.findByText('Role renamed to "Admins".');

    // Switch to the Users tab; its Role column resolves through the same roles
    // cache, which the rename invalidated, so it shows the new name.
    await userEvent.click(screen.getByRole("link", { name: /Users/ }));

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(await screen.findByText("Admins")).toBeInTheDocument();
  });

  it("has no accessibility violations with the rename dialog open", async () => {
    const role = buildRole({ name: "Administrator" });
    server.use(http.get("/api/roles", () => HttpResponse.json(pageOf([role]))));

    renderWithProviders(<RolesTab />);
    await screen.findByText("Administrator");

    const dialog = await openRenameDialog("Administrator");

    expect(await axe(dialog)).toHaveNoViolations();
  });
});
