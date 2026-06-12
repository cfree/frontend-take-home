import { delay, http, HttpResponse } from "msw";
import { axe } from "vitest-axe";
import userEvent from "@testing-library/user-event";

import { server } from "~/test/server";
import { buildRole, buildUser, pageOf } from "~/test/fixtures";
import { renderWithProviders, screen, waitFor } from "~/test/utils";
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
