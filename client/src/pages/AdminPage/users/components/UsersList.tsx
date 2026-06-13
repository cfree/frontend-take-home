import { useRef, type FC } from "react";
import { useUsers } from "~/api/users/useUsers";
import { useRolesMap } from "~/api/roles/useRoles";
import { ResultsAnnouncer } from "~/components/ResultsAnnouncer";
import { UsersTable } from "./UsersTable";
import { Box } from "@radix-ui/themes";

interface UsersTableProps {
  search?: string;
}

// A thin container that keeps a persistent results announcer
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

  // A stable, always-present focus anchor wrapping the table body. After a
  // delete removes a row, focus moves here so it isn't lost to the page body
  // when the row unmounts; the region label keeps the landing place meaningful.
  const focusAnchorRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <ResultsAnnouncer count={settledCount} noun="user" />
      <Box
        ref={focusAnchorRef}
        role="region"
        aria-label="Users table"
        tabIndex={-1}
        style={{ outline: "none" }}
      >
        <UsersTable
          usersQuery={usersQuery}
          rolesMap={rolesMap}
          focusAnchorRef={focusAnchorRef}
        />
      </Box>
    </>
  );
};
