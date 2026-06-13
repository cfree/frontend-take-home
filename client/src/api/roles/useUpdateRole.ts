import { useMutation } from "@tanstack/react-query";
import { apiUrl } from "~/lib/apiUrl";
import { roleSchema, type Role } from "./types";

// Error thrown by a failed role update, carrying the HTTP status so callers can
// distinguish a duplicate-name rejection (400) from other failures by status
// code rather than string-matching the server's message.
export class UpdateRoleError extends Error {
  readonly status: number;

  constructor(status: number) {
    super(`Failed to update role: ${status}`);
    this.name = "UpdateRoleError";
    this.status = status;
  }
}

// A partial role update. The rename slice sends only `name`, but the hook
// accepts the other editable fields so a future edit dialog can reuse it.
export type RoleUpdate = Partial<
  Pick<Role, "name" | "description" | "isDefault">
>;

interface UpdateRoleArgs {
  id: string;
  update: RoleUpdate;
}

// PATCH a partial update to a role. A non-OK status throws a typed
// UpdateRoleError carrying that status; the validated, updated role is returned
// on success.
async function updateRole({ id, update }: UpdateRoleArgs): Promise<Role> {
  const response = await fetch(apiUrl(`/roles/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(update),
  });
  if (!response.ok) {
    throw new UpdateRoleError(response.status);
  }
  return roleSchema.parse(await response.json());
}

// Typed mutation hook for updating a role. The caller orchestrates the outcome
// flow (close the dialog, invalidate the cache, toast, move focus) so the UX
// sequence stays in one place.
export function useUpdateRole() {
  return useMutation({ mutationFn: updateRole });
}
