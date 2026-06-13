import type { ComponentProps, FC, Ref } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { DropdownMenu, IconButton } from "@radix-ui/themes";

// One entry in a row's actions menu. Kept generic (label + presentation + an
// optional select handler) so the menu is reusable across row types — users
// today, roles or other entities later.
export type RowAction = {
  label: string;
  color?: ComponentProps<typeof DropdownMenu.Item>["color"];
  disabled?: boolean;
  onSelect?: () => void;
};

interface RowActionsMenuProps {
  label: string;
  actions: RowAction[];
  // Forwarded to the kebab trigger so a sibling (e.g. a confirmation dialog) can
  // restore focus here when it closes.
  triggerRef?: Ref<HTMLButtonElement>;
}

// Per-row kebab actions menu, driven by a list of action descriptors.
// `label` names the trigger for assistive tech, e.g. "Actions for Ada Lovelace".
export const RowActionsMenu: FC<RowActionsMenuProps> = ({
  label,
  actions,
  triggerRef,
}) => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <IconButton
          ref={triggerRef}
          variant="ghost"
          color="gray"
          aria-label={label}
          radius="full"
        >
          <DotsHorizontalIcon />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content side="bottom" align="end" sideOffset={4}>
        {actions.map((action) => (
          <DropdownMenu.Item
            key={action.label}
            disabled={action.disabled}
            color={action.color}
            onSelect={action.onSelect}
          >
            {action.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
};
