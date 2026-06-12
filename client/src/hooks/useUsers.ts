import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "~/api/users";
import { queryKeys } from "~/lib/queryKeys";

// Typed query hook for the users list, optionally filtered by a server-side
// `search` term.
export function useUsers(search?: string) {
  return useQuery({
    queryKey: queryKeys.users(search),
    queryFn: () => fetchUsers(search),
  });
}
