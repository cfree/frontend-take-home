import { Flex, Text } from "@radix-ui/themes";

// Reusable empty state for an async surface that resolved with no rows.
export function EmptyState({ message }: { message: string }) {
  return (
    <Flex align="center" justify="center" p="6">
      <Text color="gray">{message}</Text>
    </Flex>
  );
}
