import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "~/api/users";
import { queryKeys } from "~/lib/queryKeys";

// Typed query hook for the users list. Keyed consistently via `queryKeys` so
// the cache dedupes and stays invalidatable.
export function useUsers() {
  return useQuery({ queryKey: queryKeys.users, queryFn: fetchUsers });
}
