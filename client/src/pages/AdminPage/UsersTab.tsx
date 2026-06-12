import { Flex } from "@radix-ui/themes";
import { UsersTable } from "~/components/UsersTable";

export default function UsersTab() {
  return (
    <Flex direction="column" gap="2">
      <UsersTable />
    </Flex>
  );
}
