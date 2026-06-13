import { type FC } from "react";
import { Flex, Skeleton, Text } from "@radix-ui/themes";
import type { Role } from "~/api/roles/types";

interface RoleCellProps {
  // The role to render. Omitted only for placeholder rows, where `loading` is
  // set and the cell renders its shape as shimmering skeletons instead.
  role?: Role;
  loading?: boolean;
}

// Identity cell for a role: the name in bold with the role's description stacked
// in muted text directly beneath it — but only when a description exists, with
// no placeholder standing in for an absent one. While loading, the same name +
// description markup is wrapped in <Skeleton> so the shimmer lines up with the
// real cell.
export const RoleCell: FC<RoleCellProps> = ({ role, loading = false }) => {
  return (
    <Flex direction="column" gap="1">
      <Skeleton loading={loading}>
        <Text weight="bold">{role ? role.name : "Placeholder role"}</Text>
      </Skeleton>
      {loading ? (
        <Skeleton loading>
          <Text size="2">A short role description placeholder</Text>
        </Skeleton>
      ) : (
        role?.description && (
          <Text size="2" color="gray">
            {role.description}
          </Text>
        )
      )}
    </Flex>
  );
};
