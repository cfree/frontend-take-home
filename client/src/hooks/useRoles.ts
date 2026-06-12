import { useQuery } from "@tanstack/react-query";
import { fetchRoles, type RolesPage } from "~/api/roles";
import { queryKeys } from "~/lib/queryKeys";

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
