import { useMutation } from "@tanstack/react-query";
import { apiUrl } from "~/lib/apiUrl";

// Outcome of a delete request. A 404 means the user was already gone — the
// desired end-state already holds, so it resolves with this discriminator
// rather than throwing, letting the caller treat it as a benign success.
export type DeleteUserResult = "deleted" | "alreadyGone";

// Delete a user by id. Resolves on 200 ("deleted") and on 404 ("alreadyGone").
// Any other non-OK status throws, and a transport failure rejects on its own —
// both surface as the mutation's error state, which the dialog renders as a
// single shared inline error.
async function deleteUser(id: string): Promise<DeleteUserResult> {
  const response = await fetch(apiUrl(`/users/${id}`), { method: "DELETE" });
  if (response.status === 404) {
    return "alreadyGone";
  }
  if (!response.ok) {
    throw new Error(`Failed to delete user: ${response.status}`);
  }
  return "deleted";
}

// Typed mutation hook for deleting a user. The caller orchestrates the outcome
// flow (close the dialog, invalidate the list, toast, move focus) so the UX
// sequence stays in one place.
export function useDeleteUser() {
  return useMutation({ mutationFn: deleteUser });
}
