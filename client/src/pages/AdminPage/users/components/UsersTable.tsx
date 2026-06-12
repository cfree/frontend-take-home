import type { FC } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import { Table, Text, VisuallyHidden } from "@radix-ui/themes";
import dayjs from "dayjs";
import type { UsersPage } from "~/api/users";
import { DATE_FORMAT } from "~/lib/constants";
import { EmptyState } from "~/components/EmptyState";
import { ErrorState } from "~/components/ErrorState";
import { RowActionsMenu } from "~/components/RowActionsMenu";
import { UserCell } from "~/components/UserCell";
import { UsersTableSkeleton } from "./UsersTableSkeleton";

interface UsersTableProps {
  // The users and resolved-roles queries, owned and passed down by the
  // container so the data is fetched once. Their discriminated-union types keep
  // the loading/error/success narrowing intact here.
  usersQuery: UseQueryResult<UsersPage>;
  rolesMap: UseQueryResult<Map<string, string>>;
}

// Presentational body of the Users table: resolves the four states from the
// queries it's handed and renders the rows, mapping each user's `roleId` to its
// display name. Loading and error are gated on both queries — one skeleton until
// both resolve, one inline error if either fails.
export const UsersTable: FC<UsersTableProps> = ({ usersQuery, rolesMap }) => {
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
};
