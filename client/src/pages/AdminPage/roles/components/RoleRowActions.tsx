import { useRef, useState, type FC } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { RowActionsMenu } from "~/components/RowActionsMenu";
import { useToast } from "~/components/toast/useToast";
import { useUpdateRole, UpdateRoleError } from "~/api/roles/useUpdateRole";
import { queryKeys } from "~/lib/queryKeys";
import type { Role } from "~/api/roles/types";
import { RenameRoleDialog } from "./RenameRoleDialog";

interface RoleRowActionsProps {
  role: Role;
}

// Per-row actions for a single role: composes the generic actions menu with the
// rename dialog, owns the dialog's open state, and orchestrates the rename
// mutation's outcome.
export const RoleRowActions: FC<RoleRowActionsProps> = ({ role }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  // The name from the most recent attempt, so a duplicate-name error can quote
  // the value the user tried. Kept in state (not a ref) so it's safe to read
  // while rendering the inline error.
  const [attemptedName, setAttemptedName] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const updateRole = useUpdateRole();

  // Map a failed rename to an inline message, distinguishing a duplicate (400)
  // from other failures by status code rather than by the server's message text.
  const errorMessage = !updateRole.isError
    ? null
    : updateRole.error instanceof UpdateRoleError &&
        updateRole.error.status === 400
      ? `A role named '${attemptedName}' already exists.`
      : "Something went wrong. Please try again.";

  function handleSubmit(name: string) {
    setAttemptedName(name);
    updateRole.mutate(
      { id: role.id, update: { name } },
      {
        onSuccess: (updated) => {
          setDialogOpen(false);
          // The roles list and the Users tab's role-name map share one cache
          // key, so a single invalidation refreshes both surfaces.
          queryClient.invalidateQueries({ queryKey: queryKeys.roles });
          toast({
            variant: "success",
            message: `Role renamed to "${updated.name}".`,
          });
        },
      },
    );
  }

  return (
    <>
      <RowActionsMenu
        label={`Actions for ${role.name}`}
        triggerRef={triggerRef}
        actions={[
          {
            label: "Rename role",
            onSelect: () => {
              // Clear any error from a prior attempt so the dialog opens clean.
              updateRole.reset();
              setDialogOpen(true);
            },
          },
        ]}
      />
      <RenameRoleDialog
        role={role}
        open={dialogOpen}
        // Ignore close attempts (Cancel, Escape, overlay) while the request is
        // in flight, so the user can't dismiss the dialog mid-rename.
        onOpenChange={(open) => {
          if (!updateRole.isPending) {
            setDialogOpen(open);
          }
        }}
        onSubmit={handleSubmit}
        pending={updateRole.isPending}
        errorMessage={errorMessage}
        onCloseAutoFocus={(event) => {
          // The menu that opened this dialog has unmounted, so steer focus back
          // to the row's kebab trigger explicitly. No row ever vanishes on a
          // rename, so focus always returns here.
          event.preventDefault();
          triggerRef.current?.focus();
        }}
      />
    </>
  );
};
