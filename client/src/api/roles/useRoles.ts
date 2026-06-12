import { useQuery } from "@tanstack/react-query";
import { type RolesPage } from "~/api/roles/types";
import { queryKeys } from "~/lib/queryKeys";
import { apiUrl } from "~/lib/apiUrl";
import { rolesPageSchema } from "./types";

// Fetch the first page of roles. Same `apiUrl` + validate pattern as users; a
// non-OK response or schema mismatch throws, surfacing as the query's error.
async function fetchRoles(): Promise<RolesPage> {
  const response = await fetch(apiUrl("/roles"));
  if (!response.ok) {
    throw new Error(`Failed to fetch roles: ${response.status}`);
  }
  return rolesPageSchema.parse(await response.json());
}

// Module-level so its reference is stable across renders, letting React Query
// memoize the derived map instead of rebuilding it every render.
function selectRolesMap(page: RolesPage): Map<string, string> {
  return new Map(page.data.map((role) => [role.id, role.name]));
}

// Typed query hook for the roles list, keyed consistently via `queryKeys` so
// the cache dedupes — both the Users table (which needs role names) and the
// Roles tab share a single request without hoisting the query to a parent.
export function useRoles() {
  return useQuery({ queryKey: queryKeys.roles, queryFn: fetchRoles });
}

// A derived, memoized `roleId → name` map for resolving a user's role to its
// display name. Co-located with its consumer; the cache dedupes against
// `useRoles`, so this adds no extra request.
export function useRolesMap() {
  return useQuery({
    queryKey: queryKeys.roles,
    queryFn: fetchRoles,
    select: selectRolesMap,
  });
}
