import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "~/lib/queryKeys";
import { usersPageSchema, type UsersPage } from "./types";
import { apiUrl } from "~/lib/apiUrl";

// Fetch the first page of users, optionally filtered by a full-text `search`
// over first and last name (server-side). The URL is built via `apiUrl`
// (same-origin by default, overridable with `VITE_API_URL`); the `search`
// param is URL-encoded by `URLSearchParams` and omitted entirely when empty. A
// non-OK response or a schema mismatch throws, surfacing as the query's error
// state.
async function fetchUsers(search?: string): Promise<UsersPage> {
  const url = apiUrl("/users");

  if (search) {
    url.searchParams.set("search", search);
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }

  return usersPageSchema.parse(await response.json());
}

// Typed query hook for the users list, optionally filtered by a server-side
// `search` term.
export function useUsers(search?: string) {
  return useQuery({
    queryKey: queryKeys.users(search),
    queryFn: () => fetchUsers(search),
  });
}
