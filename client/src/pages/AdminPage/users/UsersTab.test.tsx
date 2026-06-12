import { delay, http, HttpResponse } from "msw";
import { axe } from "vitest-axe";
import userEvent from "@testing-library/user-event";

import { server } from "~/test/server";
import { buildRole, buildUser, pageOf } from "~/test/fixtures";
import { renderWithProviders, screen, waitFor, within } from "~/test/utils";
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

  it("keeps the Edit user action disabled in the row actions menu", async () => {
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
    expect(editItem).toHaveAttribute("aria-disabled", "true");
  });

  it("opens a confirmation dialog naming the user when Delete is selected", async () => {
    const user = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([user]))));

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );

    const dialog = await screen.findByRole("alertdialog");
    expect(
      within(dialog).getByText("Delete Ada Lovelace?"),
    ).toBeInTheDocument();
  });

  it("closes the dialog and returns focus to the row trigger on Cancel", async () => {
    const user = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([user]))));

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    const trigger = screen.getByRole("button", {
      name: /actions for ada lovelace/i,
    });
    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    await screen.findByRole("alertdialog");

    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("dismisses the dialog with Escape and returns focus to the row trigger", async () => {
    const user = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([user]))));

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    const trigger = screen.getByRole("button", {
      name: /actions for ada lovelace/i,
    });
    await userEvent.click(trigger);
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    await screen.findByRole("alertdialog");

    await userEvent.keyboard("{Escape}");

    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it("deletes the user, removes the row, and shows a success toast on confirm", async () => {
    const ada = buildUser({ first: "Ada", last: "Lovelace" });
    const grace = buildUser({ first: "Grace", last: "Hopper" });
    let remaining = [ada, grace];
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf(remaining))),
      http.delete("/api/users/:id", ({ params }) => {
        remaining = remaining.filter((u) => u.id !== params.id);
        return HttpResponse.json(ada);
      }),
    );

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /^delete$/i }),
    );

    // Success toast names the deleted user.
    expect(
      await screen.findByText("Ada Lovelace was deleted."),
    ).toBeInTheDocument();
    // The row reconciles away once the background refetch settles; Grace stays.
    await waitFor(() =>
      expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument(),
    );
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();
  });

  it("moves focus to the table region after a successful delete", async () => {
    const ada = buildUser({ first: "Ada", last: "Lovelace" });
    const grace = buildUser({ first: "Grace", last: "Hopper" });
    let remaining = [ada, grace];
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf(remaining))),
      http.delete("/api/users/:id", ({ params }) => {
        remaining = remaining.filter((u) => u.id !== params.id);
        return HttpResponse.json(ada);
      }),
    );

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /^delete$/i }),
    );

    await waitFor(() =>
      expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument(),
    );
    // Focus parks on a stable anchor in the table region rather than falling to
    // the page body when the deleted row unmounts.
    expect(screen.getByRole("region", { name: /users table/i })).toHaveFocus();
  });

  it("presents a busy state and blocks double-submit while the delete is in flight", async () => {
    const ada = buildUser({ first: "Ada", last: "Lovelace" });
    let deleteCount = 0;
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf([ada]))),
      http.delete("/api/users/:id", async () => {
        deleteCount++;
        await delay("infinite");
        return HttpResponse.json(ada);
      }),
    );

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    const deleteButton = await screen.findByRole("button", {
      name: /^delete$/i,
    });
    await userEvent.click(deleteButton);

    // Both buttons present a busy/disabled state (aria, not native disabled, so
    // focus survives), and the Delete button stays focused for instant retry.
    await waitFor(() =>
      expect(deleteButton).toHaveAttribute("aria-busy", "true"),
    );
    expect(deleteButton).toHaveAttribute("aria-disabled", "true");
    expect(deleteButton).toHaveFocus();
    expect(screen.getByRole("button", { name: /cancel/i })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    // The dialog stays open while the request is outstanding.
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    // A second click while in flight does not fire a second request.
    await userEvent.click(deleteButton);
    expect(deleteCount).toBe(1);
  });

  it("does not flash the loading skeleton during the post-delete refetch", async () => {
    const ada = buildUser({ first: "Ada", last: "Lovelace" });
    const grace = buildUser({ first: "Grace", last: "Hopper" });
    let remaining = [ada, grace];
    let getCount = 0;
    server.use(
      http.get("/api/users", async () => {
        getCount += 1;
        // Delay only the post-delete refetch so there's a real window in which
        // a skeleton could wrongly appear.
        if (getCount > 1) {
          await delay(100);
        }
        return HttpResponse.json(pageOf(remaining));
      }),
      http.delete("/api/users/:id", ({ params }) => {
        remaining = remaining.filter((u) => u.id !== params.id);
        return HttpResponse.json(ada);
      }),
    );

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /^delete$/i }),
    );

    // Success fires and the refetch is in flight; the existing rows stay put and
    // no loading skeleton appears (it's gated on no-data pending, not fetching).
    await screen.findByText("Ada Lovelace was deleted.");
    expect(
      screen.queryByRole("status", { name: /loading/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();

    await waitFor(() =>
      expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument(),
    );
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

    // Exact copy targets the visible empty state, not the terse live-region
    // status ("No users found", no period) the announcer also renders.
    expect(await screen.findByText("No users found.")).toBeInTheDocument();
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
    await screen.findByText("No users found.");

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

  it("shows the empty state after the last user is deleted", async () => {
    const ada = buildUser({ first: "Ada", last: "Lovelace" });
    let remaining = [ada];
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf(remaining))),
      http.delete("/api/users/:id", ({ params }) => {
        remaining = remaining.filter((u) => u.id !== params.id);
        return HttpResponse.json(ada);
      }),
    );

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /^delete$/i }),
    );

    expect(await screen.findByText("No users found.")).toBeInTheDocument();
  });

  it("warns and reconciles when deleting a user that is already gone (404)", async () => {
    const ada = buildUser({ first: "Ada", last: "Lovelace" });
    let remaining = [ada];
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf(remaining))),
      http.delete("/api/users/:id", () => {
        // The user was already removed on the server by someone else.
        remaining = [];
        return HttpResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }),
    );

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /^delete$/i }),
    );

    // Treated as a benign success: warning toast, dialog closes, row reconciles
    // away, and no inline error traps the user.
    expect(
      await screen.findByText("No action taken, user not found."),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument(),
    );
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
  });

  it("keeps the dialog open with an inline error when the delete server-fails (500)", async () => {
    const ada = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf([ada]))),
      http.delete(
        "/api/users/:id",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    const deleteButton = await screen.findByRole("button", {
      name: /^delete$/i,
    });
    await userEvent.click(deleteButton);

    // The dialog stays open and surfaces a shared, announced inline error.
    const dialog = screen.getByRole("alertdialog");
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again.",
    );
    // Both buttons are re-enabled so the user can retry or cancel.
    expect(deleteButton).not.toHaveAttribute("aria-busy", "true");
    expect(deleteButton).not.toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("button", { name: /cancel/i })).not.toHaveAttribute(
      "aria-disabled",
      "true",
    );
    // Focus stays on Delete for an instant retry.
    expect(deleteButton).toHaveFocus();
  });

  it("shows the same inline error when the delete hits a network failure", async () => {
    const ada = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf([ada]))),
      http.delete("/api/users/:id", () => HttpResponse.error()),
    );

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    const deleteButton = await screen.findByRole("button", {
      name: /^delete$/i,
    });
    await userEvent.click(deleteButton);

    const dialog = screen.getByRole("alertdialog");
    expect(await within(dialog).findByRole("alert")).toHaveTextContent(
      "Something went wrong. Please try again.",
    );
    expect(deleteButton).toHaveFocus();
  });

  it("has no accessibility violations with the inline error shown in the dialog", async () => {
    const ada = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(
      http.get("/api/users", () => HttpResponse.json(pageOf([ada]))),
      http.delete(
        "/api/users/:id",
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    await userEvent.click(
      await screen.findByRole("button", { name: /^delete$/i }),
    );

    const dialog = screen.getByRole("alertdialog");
    await within(dialog).findByRole("alert");

    expect(await axe(dialog)).toHaveNoViolations();
  });

  it("has no accessibility violations with the confirmation dialog open", async () => {
    const user = buildUser({ first: "Ada", last: "Lovelace" });
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([user]))));

    renderWithProviders(<UsersTab />);
    await screen.findByText("Ada Lovelace");

    await userEvent.click(
      screen.getByRole("button", { name: /actions for ada lovelace/i }),
    );
    await userEvent.click(
      await screen.findByRole("menuitem", { name: /delete user/i }),
    );
    const dialog = await screen.findByRole("alertdialog");

    expect(await axe(dialog)).toHaveNoViolations();
  });
});

describe("UsersTab search", () => {
  it("issues a server-side search request and renders matching rows when deep-linked with ?search=", async () => {
    const ada = buildUser({ first: "Ada", last: "Lovelace" });
    let searchParam: string | null = null;
    server.use(
      http.get("/api/users", ({ request }) => {
        searchParam = new URL(request.url).searchParams.get("search");
        return HttpResponse.json(pageOf([ada]));
      }),
    );

    renderWithProviders(<UsersTab />, { route: "/users?search=ada" });

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(searchParam).toBe("ada");
  });

  it("commits a typed name and filters the table after the debounce", async () => {
    const user = userEvent.setup();
    const ada = buildUser({ first: "Ada", last: "Lovelace" });
    let lastSearch: string | null = null;
    server.use(
      http.get("/api/users", ({ request }) => {
        lastSearch = new URL(request.url).searchParams.get("search");
        return HttpResponse.json(pageOf([ada]));
      }),
    );

    renderWithProviders(<UsersTab />, { route: "/users" });
    await screen.findByText("Ada Lovelace");

    await user.type(screen.getByRole("searchbox", { name: /search/i }), "ada");

    await waitFor(() => expect(lastSearch).toBe("ada"));
  });

  it("coalesces a burst of keystrokes into a single trailing request", async () => {
    const user = userEvent.setup();
    const searched: string[] = [];
    server.use(
      http.get("/api/users", ({ request }) => {
        const term = new URL(request.url).searchParams.get("search");
        if (term !== null) {
          searched.push(term);
        }
        return HttpResponse.json(
          pageOf([buildUser({ first: "Ada", last: "Lovelace" })]),
        );
      }),
    );

    renderWithProviders(<UsersTab />, { route: "/users" });
    await screen.findByText("Ada Lovelace");

    await user.type(screen.getByRole("searchbox", { name: /search/i }), "ada");

    // Only the settled term is requested — not one request per character.
    await waitFor(() => expect(searched).toEqual(["ada"]));
  });

  it("searches apostrophes and hyphens literally", async () => {
    const user = userEvent.setup();
    let lastSearch: string | null = null;
    server.use(
      http.get("/api/users", ({ request }) => {
        lastSearch = new URL(request.url).searchParams.get("search");
        return HttpResponse.json(
          pageOf([buildUser({ first: "O'Brien", last: "Smith-Jones" })]),
        );
      }),
    );

    renderWithProviders(<UsersTab />, { route: "/users" });
    await screen.findByText("O'Brien Smith-Jones");

    await user.type(
      screen.getByRole("searchbox", { name: /search/i }),
      "o'brien",
    );

    await waitFor(() => expect(lastSearch).toBe("o'brien"));
  });

  it("trims leading and trailing whitespace when committing the term", async () => {
    const user = userEvent.setup();
    let lastSearch: string | null = null;
    server.use(
      http.get("/api/users", ({ request }) => {
        lastSearch = new URL(request.url).searchParams.get("search");
        return HttpResponse.json(
          pageOf([buildUser({ first: "Ada", last: "Lovelace" })]),
        );
      }),
    );

    renderWithProviders(<UsersTab />, { route: "/users" });
    await screen.findByText("Ada Lovelace");

    await user.type(
      screen.getByRole("searchbox", { name: /search/i }),
      "  ada lovelace  ",
    );

    // Ends trimmed; the internal space is preserved.
    await waitFor(() => expect(lastSearch).toBe("ada lovelace"));
  });

  it("never commits a whitespace-only or untrimmed term", async () => {
    const user = userEvent.setup();
    const searched: string[] = [];
    server.use(
      http.get("/api/users", ({ request }) => {
        const term = new URL(request.url).searchParams.get("search");
        if (term !== null) {
          searched.push(term);
        }
        return HttpResponse.json(
          pageOf([buildUser({ first: "Ada", last: "Lovelace" })]),
        );
      }),
    );

    renderWithProviders(<UsersTab />, { route: "/users" });
    const box = await screen.findByRole("searchbox", { name: /search/i });

    // Leading whitespace must never produce a filtered request of its own, and
    // the eventual commit is the trimmed term — so the only request that ever
    // carries `search` is the clean "ada".
    await user.type(box, "   ada");

    await waitFor(() => expect(searched).toEqual(["ada"]));
  });

  it("clears the search and re-requests the full, unfiltered list", async () => {
    const user = userEvent.setup();
    let lastSearch: string | null = "unset";
    server.use(
      http.get("/api/users", ({ request }) => {
        lastSearch = new URL(request.url).searchParams.get("search");
        return HttpResponse.json(
          pageOf([buildUser({ first: "Ada", last: "Lovelace" })]),
        );
      }),
    );

    renderWithProviders(<UsersTab />, { route: "/users?search=ada" });
    await screen.findByText("Ada Lovelace");
    expect(lastSearch).toBe("ada");

    await user.clear(screen.getByRole("searchbox", { name: /search/i }));

    await waitFor(() => expect(lastSearch).toBeNull());
  });

  it("caps the search input at 100 characters", () => {
    renderWithProviders(<UsersTab />, { route: "/users" });

    expect(screen.getByRole("searchbox", { name: /search/i })).toHaveAttribute(
      "maxlength",
      "100",
    );
  });

  it("gives the search input a real accessible name, not the placeholder", () => {
    renderWithProviders(<UsersTab />, { route: "/users" });

    expect(
      screen.getByRole("searchbox", { name: "Search users by name" }),
    ).toBeInTheDocument();
  });

  it("keeps the search input mounted with its text and focus when a search errors", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("/api/users", ({ request }) => {
        const term = new URL(request.url).searchParams.get("search");
        if (term) {
          return new HttpResponse(null, { status: 500 });
        }
        return HttpResponse.json(
          pageOf([buildUser({ first: "Ada", last: "Lovelace" })]),
        );
      }),
    );

    renderWithProviders(<UsersTab />, { route: "/users" });
    const box = await screen.findByRole("searchbox", { name: /search/i });
    box.focus();
    await user.type(box, "ada");

    expect(await screen.findByRole("alert")).toBeInTheDocument();
    const boxAfterError = screen.getByRole("searchbox", { name: /search/i });
    expect(boxAfterError).toHaveValue("ada");
    expect(boxAfterError).toHaveFocus();
  });
});

describe("UsersTab search announcements", () => {
  it("announces the result count to screen readers after a search settles", async () => {
    const user = userEvent.setup();
    server.use(
      http.get("/api/users", ({ request }) => {
        const term = new URL(request.url).searchParams.get("search");
        const users = term
          ? [buildUser({ first: "Ada", last: "Lovelace" })]
          : [
              buildUser({ first: "Ada", last: "Lovelace" }),
              buildUser({ first: "Grace", last: "Hopper" }),
            ];
        return HttpResponse.json(pageOf(users));
      }),
    );

    renderWithProviders(<UsersTab />, { route: "/users" });
    await screen.findByText("Grace Hopper");

    await user.type(screen.getByRole("searchbox", { name: /search/i }), "ada");

    expect(await screen.findByText("1 user found")).toBeInTheDocument();
  });

  it("announces no results when a search matches nobody", async () => {
    server.use(http.get("/api/users", () => HttpResponse.json(pageOf([]))));

    renderWithProviders(<UsersTab />, { route: "/users?search=zzz" });

    expect(await screen.findByRole("status")).toHaveTextContent(
      /no users found/i,
    );
  });

  it("keeps the results status quiet while a search is pending", async () => {
    server.use(
      http.get("/api/users", async () => {
        await delay("infinite");
        return HttpResponse.json(pageOf([]));
      }),
    );

    renderWithProviders(<UsersTab />, { route: "/users" });

    expect(
      await screen.findByRole("status", { name: /loading/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/users found/i)).not.toBeInTheDocument();
  });

  it("has no accessibility violations with the search toolbar and results status", async () => {
    server.use(
      http.get("/api/users", () =>
        HttpResponse.json(
          pageOf([buildUser({ first: "Ada", last: "Lovelace" })]),
        ),
      ),
    );

    const { container } = renderWithProviders(<UsersTab />, {
      route: "/users",
    });
    await screen.findByText("Ada Lovelace");

    expect(await axe(container)).toHaveNoViolations();
  });
});
