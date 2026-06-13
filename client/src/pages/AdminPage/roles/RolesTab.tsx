import {
  Badge,
  Box,
  IconButton,
  Skeleton,
  Table,
  VisuallyHidden,
} from "@radix-ui/themes";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { ROLES_TABLE_COLUMN_WIDTHS } from "~/lib/constants";
import type { Role } from "~/api/roles/types";
import { useRoles } from "~/api/roles/useRoles";
import { EmptyState } from "~/components/EmptyState";
import { ErrorState } from "~/components/ErrorState";
import { RoleCell } from "./components/RoleCell";
import { RoleRowActions } from "./components/RoleRowActions";
import RowCell from "~/components/RowCell";

// How many placeholder rows to show while loading — enough to read as "a table
// is loading here" without dominating the viewport.
const SKELETON_ROW_COUNT = 5;

// The Roles tab: lists every role in a single table. Simpler than the Users tab
// — no search, no pagination, one query — so the container folds in here rather
// than splitting into a separate list wrapper. Loading and live data share one
// table: while the query is pending we render placeholder rows whose cells wrap
// their content in <Skeleton loading>, so the shimmer matches the real cells and
// the layout never jumps when data arrives.
export default function RolesTab() {
  const rolesQuery = useRoles();

  if (rolesQuery.isError) {
    return <ErrorState message="We couldn't load roles. Please try again." />;
  }

  if (rolesQuery.isSuccess && rolesQuery.data.data.length === 0) {
    return <EmptyState message="No roles found." />;
  }

  // Real roles once the query resolves; otherwise placeholder sentinels that
  // render as skeleton rows.
  const rows: (Role | undefined)[] = rolesQuery.isSuccess
    ? rolesQuery.data.data
    : Array.from({ length: SKELETON_ROW_COUNT }, () => undefined);

  return (
    <Box
      // While loading, the table is a live status region named for assistive
      // tech; Radix marks the skeleton content aria-hidden so only this label is
      // announced. Once data resolves it's a plain container again.
      {...(!rolesQuery.isSuccess
        ? { role: "status", "aria-label": "Loading roles…" }
        : {})}
    >
      <Table.Root variant="surface" style={{ tableLayout: "fixed" }}>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell width={ROLES_TABLE_COLUMN_WIDTHS.name}>
              Name
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={ROLES_TABLE_COLUMN_WIDTHS.default}>
              <VisuallyHidden>Default</VisuallyHidden>
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell width={ROLES_TABLE_COLUMN_WIDTHS.actions}>
              <VisuallyHidden>Actions</VisuallyHidden>
            </Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((role, index) => (
            <Table.Row key={role?.id ?? `skeleton-${index}`}>
              <RowCell>
                <RoleCell role={role} loading={!rolesQuery.isSuccess} />
              </RowCell>
              <RowCell>
                <Skeleton loading={!rolesQuery.isSuccess}>
                  {role && !role.isDefault ? null : <Badge>Default</Badge>}
                </Skeleton>
              </RowCell>
              <RowCell>
                {role ? (
                  <RoleRowActions role={role} />
                ) : (
                  <Skeleton loading>
                    <IconButton variant="ghost" color="gray" radius="full">
                      <DotsHorizontalIcon />
                    </IconButton>
                  </Skeleton>
                )}
              </RowCell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
