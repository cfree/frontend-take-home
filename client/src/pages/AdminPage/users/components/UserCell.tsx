import { type FC } from "react";
import { Avatar, Flex, Skeleton, Text } from "@radix-ui/themes";
import type { User } from "~/api/users/types";

interface UserCellProps {
  user?: User;
  loading?: boolean;
}

export const UserCell: FC<UserCellProps> = ({ user, loading = false }) => {
  const fullName = user ? `${user.first} ${user.last}` : "Placeholder Name";
  const initials = user
    ? `${user.first.charAt(0)}${user.last.charAt(0)}`.toUpperCase()
    : "";

  return (
    <Flex align="center" gap="3">
      <Skeleton loading={loading}>
        <Avatar
          size="1"
          radius="full"
          src={user?.photo}
          alt={fullName}
          fallback={initials}
        />
      </Skeleton>
      <Skeleton loading={loading}>
        <Text size="2">{fullName}</Text>
      </Skeleton>
    </Flex>
  );
};
