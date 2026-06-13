import { type FC } from "react";
import { Flex, Skeleton, Text } from "@radix-ui/themes";
import type { Role } from "~/api/roles/types";

interface RoleCellProps {
  role?: Role;
  loading?: boolean;
}

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
