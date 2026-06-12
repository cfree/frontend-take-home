import { useRef, useState, type FC, type RefObject } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RowActionsMenu } from "~/components/RowActionsMenu";
import { useToast } from "~/components/toast/ToastContext";
import { useDeleteUser } from "~/api/users/useDeleteUser";
import { queryKeys } from "~/lib/queryKeys";
import type { User } from "~/api/users/types";
import { DeleteUserDialog } from "./DeleteUserDialog";

interface UserRowActionsProps {
  user: User;
  // Stable anchor in the table region, owned by the list, that survives this
  // row unmounting — focus lands here after a successful delete so it isn't
  // lost to the page body.
  focusAnchorRef: RefObject<HTMLElement | null>;
}

// Per-row actions for a single user: composes the generic actions menu with the
// delete confirmation dialog and owns the dialog's open state. Concentrating the
// user-specific delete wiring here keeps RowActionsMenu reusable for other row
// types.
export const UserRowActions: FC<UserRowActionsProps> = ({
  user,
  focusAnchorRef,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  // Set when a delete succeeds so the dialog's close-focus lands on the table
  // anchor (the row is going away) instead of returning to the row trigger.
  const deletedRef = useRef(false);
  const queryClient = useQueryClient();
  const toast = useToast();
  const deleteUser = useDeleteUser();
  const fullName = `${user.first} ${user.last}`;

  function handleConfirm() {
    deleteUser.mutate(user.id, {
      onSuccess: (result) => {
        // Both outcomes end with the user absent, so both close the dialog,
        // reconcile the list, and move focus off the vanishing row — they differ
        // only in the toast.
        deletedRef.current = true;
        setDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: queryKeys.usersAll });
        if (result === "alreadyGone") {
          toast({
            variant: "warning",
            message: "No action taken, user not found.",
          });
        } else {
          toast({ variant: "success", message: `${fullName} was deleted.` });
        }
      },
    });
  }

  function handleCloseAutoFocus(event: Event) {
    event.preventDefault();
    if (deletedRef.current) {
      deletedRef.current = false;
      focusAnchorRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }

  return (
    <>
      <RowActionsMenu
        label={`Actions for ${fullName}`}
        triggerRef={triggerRef}
        actions={[
          { label: "Edit user", disabled: true },
          {
            label: "Delete user",
            onSelect: () => {
              // Clear any error from a prior attempt so the dialog opens clean.
              deleteUser.reset();
              setDialogOpen(true);
            },
          },
        ]}
      />
      <DeleteUserDialog
        user={user}
        open={dialogOpen}
        // Ignore close attempts (Cancel, Escape, overlay) while the request is
        // in flight, so the user can't dismiss the dialog mid-delete.
        onOpenChange={(open) => {
          if (!deleteUser.isPending) {
            setDialogOpen(open);
          }
        }}
        onConfirm={handleConfirm}
        onCloseAutoFocus={handleCloseAutoFocus}
        pending={deleteUser.isPending}
        error={deleteUser.isError}
      />
    </>
  );
};
