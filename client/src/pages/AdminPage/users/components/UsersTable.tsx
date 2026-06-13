import type { FC, RefObject } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import {
  Box,
  IconButton,
  Skeleton,
  Table,
  Text,
  VisuallyHidden,
} from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import dayjs from "dayjs";
import type { User, UsersPage } from "~/api/users/types";
import { DATE_FORMAT, USERS_TABLE_COLUMN_WIDTHS } from "~/lib/constants";
import { EmptyState } from "~/components/EmptyState";
import { ErrorState } from "~/components/ErrorState";
import { UserCell } from "./UserCell";
import { UserRowActions } from "./UserRowActions";
import RowCell from "~/components/RowCell";

// How many placeholder rows to show while loading — enough to read as "a table
// is loading here" without dominating the viewport.
const SKELETON_ROW_COUNT = 5;

interface UsersTableProps {
  // The users and resolved-roles queries, owned and passed down by the
  // container so the data is fetched once. Their discriminated-union types keep
  // the loading/error/success narrowing intact here.
  usersQuery: UseQueryResult<UsersPage>;
  rolesMap: UseQueryResult<Map<string, string>>;
  // Stable focus anchor in the table region, passed to each row's actions so
  // focus survives a deleted row unmounting.
  focusAnchorRef: RefObject<HTMLElement | null>;
}

// The Users table. Loading and live data share one table: while either query is
// pending we render placeholder rows whose cells wrap their content in
// <Skeleton loading>, so the shimmer is sized by the exact markup that renders
// real users and the layout never jumps when data arrives. Error and empty are
// gated on both queries — one inline error if either fails, one empty state once
// both resolve with no users.
export const UsersTable: FC<UsersTableProps> = ({
  usersQuery,
  rolesMap,
  focusAnchorRef,
}) => {
  if (usersQuery.isError || rolesMap.isError) {
    return <ErrorState message="We couldn't load users. Please try again." />;
  }

  const ready = usersQuery.isSuccess && rolesMap.isSuccess;

  if (usersQuery.isSuccess && usersQuery.data.data.length === 0) {
    return <EmptyState message="No users found." />;
  }

  // Real users once both queries resolve; otherwise placeholder sentinels that
  // render as skeleton rows.
  const rows: (User | undefined)[] =
    usersQuery.isSuccess && rolesMap.isSuccess
      ? usersQuery.data.data
      : Array.from({ length: SKELETON_ROW_COUNT }, () => undefined);

  return (
    <Box
      maxWidth="850"
      // While loading, the table is a live status region named for assistive
      // tech; Radix marks the skeleton content aria-hidden so only this label is
      // announced. Once data resolves it's a plain container and the results
      // announcer (in UsersList) takes over.
      {...(!ready ? { role: "status", "aria-label": "Loading users…" } : {})}
    >
      <Table.Root variant="surface" style={{ tableLayout: "fixed" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell width={USERS_TABLE_COLUMN_WIDTHS.user}>
              User
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={USERS_TABLE_COLUMN_WIDTHS.role}>
              Role
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={USERS_TABLE_COLUMN_WIDTHS.joined}>
              Joined
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={USERS_TABLE_COLUMN_WIDTHS.actions}>
              <VisuallyHidden>Actions</VisuallyHidden>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((user, index) => {
            const roleName =
              user && rolesMap.isSuccess
                ? rolesMap.data.get(user.roleId)
                : undefined;
            return (
              <Table.Row key={user?.id ?? `skeleton-${index}`}>
                <RowCell>
                  <UserCell user={user} loading={!ready} />
                </RowCell>
                <RowCell>
                  <Skeleton loading={!ready}>
                    <Text size="2">
                      {user ? roleName : "Developer Experience"}
                    </Text>
                  </Skeleton>
                </RowCell>
                <RowCell>
                  <Skeleton loading={!ready}>
                    <Text size="2">
                      {user
                        ? dayjs(user.createdAt).format(DATE_FORMAT)
                        : "Aug 27, 2024"}
                    </Text>
                  </Skeleton>
                </RowCell>
                <RowCell justify="end">
                  {user ? (
                    <UserRowActions
                      user={user}
                      focusAnchorRef={focusAnchorRef}
                    />
                  ) : (
                    <Skeleton loading>
                      <IconButton variant="ghost" color="gray" radius="full">
                        <DotsHorizontalIcon />
                      </IconButton>
                    </Skeleton>
                  )}
                </RowCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
