import { Table, Text, VisuallyHidden } from "@radix-ui/themes";
import dayjs from "dayjs";
import { useUsers } from "~/hooks/useUsers";
import { useRolesMap } from "~/hooks/useRoles";
import { DATE_FORMAT } from "~/lib/constants";
import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";
import { RowActionsMenu } from "./RowActionsMenu";
import { UserCell } from "./UserCell";
import { UsersTableSkeleton } from "./UsersTableSkeleton";

// The Users table. Fetches users and roles through typed query hooks and
// renders the first page, resolving each user's role to its name. The loading
// and error states are gated on both queries: one skeleton until both resolve,
// one inline error if either fails.
export function UsersTable() {
  const usersQuery = useUsers();
  const rolesMap = useRolesMap();

  if (usersQuery.isPending || rolesMap.isPending) {
    return <UsersTableSkeleton />;
  }

  if (usersQuery.isError || rolesMap.isError) {
    return <ErrorState message="We couldn't load users. Please try again." />;
  }

  const users = usersQuery.data.data;

  if (users.length === 0) {
    return <EmptyState message="No users found." />;
  }

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>User</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Role</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Joined</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <VisuallyHidden>Actions</VisuallyHidden>
          </Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {users.map((user) => {
          const fullName = `${user.first} ${user.last}`;
          const roleName = rolesMap.data.get(user.roleId);
          return (
            <Table.Row key={user.id}>
              <Table.Cell>
                <UserCell user={user} />
              </Table.Cell>
              <Table.Cell>{roleName ?? <Text color="gray">—</Text>}</Table.Cell>
              <Table.Cell>
                {dayjs(user.createdAt).format(DATE_FORMAT)}
              </Table.Cell>
              <Table.Cell>
                <RowActionsMenu label={`Actions for ${fullName}`} />
              </Table.Cell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table.Root>
  );
}
