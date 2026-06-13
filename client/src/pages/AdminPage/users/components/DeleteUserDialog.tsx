import type { FC } from "react";
import { AlertDialog, Box, Button, Flex, Spinner } from "@radix-ui/themes";
import { ErrorState } from "~/components/ErrorState";
import type { User } from "~/api/users/types";

interface DeleteUserDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  // True while the delete request is outstanding. Both buttons take a busy state
  // via aria-disabled + aria-busy (not the native disabled attribute, so focus
  // stays on Delete for an instant retry) and their handlers are guarded so the
  // request can't be double-submitted or cancelled mid-flight.
  pending?: boolean;
  // Where focus goes when the dialog closes. Selecting the menu item that opens
  // this dialog unmounts the menu, so Radix's default focus-restore target is
  // gone; the parent steers focus explicitly (the row trigger on cancel, a
  // stable table anchor after a successful delete removes the row).
  onCloseAutoFocus?: (event: Event) => void;
  // True when the last attempt failed (server or network). Surfaces a shared,
  // announced inline error and keeps the dialog open so the user can retry.
  error?: boolean;
}

// Confirmation dialog for deleting a user, built on Radix Themes' AlertDialog so
// it gets a focus trap, Escape-to-cancel, focus return on close, and
// title/description labelling for free.
//
// The dialog's open state is controlled by the parent (rendered as a sibling of
// the actions menu, not nested in it) and the Delete button is a plain button
// rather than AlertDialog.Action: the parent decides when to close, so the
// dialog can stay open while the request is in flight or after it fails.
export const DeleteUserDialog: FC<DeleteUserDialogProps> = ({
  user,
  open,
  onOpenChange,
  onConfirm,
  onCloseAutoFocus,
  pending = false,
  error = false,
}) => {
  const fullName = `${user.first} ${user.last}`;

  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Content maxWidth="536px" onCloseAutoFocus={onCloseAutoFocus}>
        <AlertDialog.Title>Delete user</AlertDialog.Title>
        <AlertDialog.Description>
          Are you sure? The user <strong>{fullName}</strong> will be permanently
          deleted.
        </AlertDialog.Description>

        {error && (
          <Box mt="4">
            <ErrorState message="Something went wrong. Please try again." />
          </Box>
        )}

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <Button
              variant="outline"
              color="gray"
              aria-disabled={pending}
              onClick={(event) => {
                if (pending) {
                  event.preventDefault();
                }
              }}
            >
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <Button
            variant="outline"
            color="red"
            aria-disabled={pending}
            aria-busy={pending}
            onClick={() => {
              if (!pending) {
                onConfirm();
              }
            }}
          >
            <Spinner loading={pending} />
            Delete user
          </Button>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
};
