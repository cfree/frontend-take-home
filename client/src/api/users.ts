import { z } from "zod";
import { apiUrl } from "./lib/apiUrl";
import { pagedSchema } from "./lib/pagedData";

// Mirrors the server's `User` model (server/src/models/user.ts). Parsing the
// response with a schema — rather than trusting the JSON — is part of handling
// a backend that injects random 500s and malformed-edge latency gracefully.
export const userSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  first: z.string(),
  last: z.string(),
  roleId: z.string(),
  photo: z.string().optional(),
});

export type User = z.infer<typeof userSchema>;

// The paged envelope wrapping the users list.
export const usersPageSchema = pagedSchema(userSchema);

export type UsersPage = z.infer<typeof usersPageSchema>;

// Fetch the first page of users. The URL is built via `apiUrl` (same-origin by
// default, overridable with `VITE_API_URL`). A non-OK response or a schema
// mismatch throws, surfacing as the query's error state.
export async function fetchUsers(): Promise<UsersPage> {
  const response = await fetch(apiUrl("/users"));
  if (!response.ok) {
    throw new Error(`Failed to fetch users: ${response.status}`);
  }
  return usersPageSchema.parse(await response.json());
}
