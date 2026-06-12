import type { FC } from "react";
import { useUsers } from "~/hooks/useUsers";
import { useRolesMap } from "~/hooks/useRoles";
import { ResultsAnnouncer } from "~/components/ResultsAnnouncer";
import { UsersTable } from "./UsersTable";

interface UsersTableProps {
  // Optional full-text term filtering the list server-side by name.
  search?: string;
}

// The Users table. A thin container that keeps a persistent results announcer
// mounted ahead of the table body, so a settled count is reliably reported to
// assistive tech across the body's loading/empty/error transitions. The actual
// rows (and those states) live in UsersTableContent.
export const UsersList: FC<UsersTableProps> = ({ search }) => {
  const usersQuery = useUsers(search);
  const rolesMap = useRolesMap();

  // Settled count once both queries succeed; null while pending or errored so
  // the announcer stays silent (the skeleton and error alert cover those).
  const settledCount =
    usersQuery.isSuccess && rolesMap.isSuccess
      ? usersQuery.data.data.length
      : null;

  return (
    <>
      <ResultsAnnouncer count={settledCount} noun="user" />
      <UsersTable usersQuery={usersQuery} rolesMap={rolesMap} />
    </>
  );
};
