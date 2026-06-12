import {
  Avatar,
  Flex,
  Skeleton,
  Table,
  Text,
  VisuallyHidden,
} from "@radix-ui/themes";

// Number of placeholder rows shown while the users request is in flight — a
// handful is enough to read as "a table is loading here".
const SKELETON_ROW_COUNT = 5;
const SKELETON_ROWS = Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => i);

// Loading state for the users table: the real table's shape rendered with Radix
// Skeletons so the layout doesn't jump when data arrives. `role="status"` plus
// an `aria-label` give assistive tech an accessible name; Radix marks the
// skeleton content `aria-hidden`, so the placeholder text isn't announced.
export function UsersTableSkeleton() {
  return (
    <div role="status" aria-label="Loading users…">
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
          {SKELETON_ROWS.map((row) => (
            <Table.Row key={row}>
              <Table.Cell>
                <Flex align="center" gap="3">
                  <Skeleton>
                    <Avatar size="1" radius="full" fallback="" />
                  </Skeleton>
                  <Skeleton>
                    <Text>Placeholder name</Text>
                  </Skeleton>
                </Flex>
              </Table.Cell>
              <Table.Cell>
                <Skeleton>
                  <Text>Member</Text>
                </Skeleton>
              </Table.Cell>
              <Table.Cell>
                <Skeleton>
                  <Text>Aug 27, 2024</Text>
                </Skeleton>
              </Table.Cell>
              <Table.Cell>
                <Skeleton></Skeleton>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </div>
  );
}
