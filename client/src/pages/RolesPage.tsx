import { Flex, Heading, Text } from "@radix-ui/themes";

// The Roles tab is a navigable, stubbed destination for now — role management
// is a later PRD. The roles data query still gets built (the Users tab needs it
// to resolve role names), but this screen stays a placeholder.
export function RolesPage() {
  return (
    <Flex direction="column" gap="2">
      <Heading size="4">Roles</Heading>
      <Text color="gray">Role management is coming soon.</Text>
    </Flex>
  );
}
