import { type FC } from "react";
import { Flex, Text } from "@radix-ui/themes";

interface EmptyStateProps {
  message: string;
}

// Reusable empty state for an async surface that resolved with no rows.
export const EmptyState: FC<EmptyStateProps> = ({ message }) => {
  return (
    <Flex align="center" justify="center" p="6">
      <Text color="gray">{message}</Text>
    </Flex>
  );
};
