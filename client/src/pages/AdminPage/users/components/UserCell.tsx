import { type FC } from "react";
import { Avatar, Flex, Skeleton, Text } from "@radix-ui/themes";
import type { User } from "~/api/users/types";

interface UserCellProps {
  // The user to render. Omitted only for placeholder rows, where `loading` is
  // set and the cell renders its shape as shimmering skeletons instead.
  user?: User;
  loading?: boolean;
}

// Reusable identity cell: a user's avatar (their photo, falling back to their
// initials) beside their full name. Shared so any surface that lists people
// renders them consistently — including the loading shimmer, which is the same
// avatar + name markup wrapped in <Skeleton> so it lines up perfectly with the
// real cell.
export const UserCell: FC<UserCellProps> = ({ user, loading = false }) => {
  // While loading there's no user; these placeholders only size the shimmer,
  // since Skeleton hides their contents.
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
