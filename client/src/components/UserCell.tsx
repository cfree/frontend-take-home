import { Avatar, Flex, Text } from "@radix-ui/themes";
import type { User } from "~/api/users";

// Reusable identity cell: a user's avatar (their photo, falling back to their
// initials) beside their full name. Shared so any surface that lists people
// renders them consistently.
export function UserCell({ user }: { user: User }) {
  const fullName = `${user.first} ${user.last}`;
  const initials =
    `${user.first.charAt(0)}${user.last.charAt(0)}`.toUpperCase();

  return (
    <Flex align="center" gap="3">
      <Avatar
        size="1"
        radius="full"
        src={user.photo}
        alt={fullName}
        fallback={initials}
      />
      <Text>{fullName}</Text>
    </Flex>
  );
}
