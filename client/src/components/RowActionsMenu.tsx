import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { DropdownMenu, IconButton } from "@radix-ui/themes";

// Per-row kebab actions menu.
// `label` names the trigger for assistive tech, e.g. "Actions for Ada Lovelace".
export function RowActionsMenu({ label }: { label: string }) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" color="gray" aria-label={label}>
          <DotsHorizontalIcon radius="radius/full" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item disabled>Edit user</DropdownMenu.Item>
        <DropdownMenu.Item disabled color="red">
          Delete user
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
