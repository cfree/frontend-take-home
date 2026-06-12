import { z } from "zod";
import { apiUrl } from "./lib/apiUrl";
import { pagedSchema } from "./lib/pagedData";

// Mirrors the server's `Role` model (server/src/models/role.ts).
export const roleSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  name: z.string(),
  description: z.string().optional(),
  isDefault: z.boolean(),
});

export type Role = z.infer<typeof roleSchema>;

// The paged envelope wrapping the roles list.
export const rolesPageSchema = pagedSchema(roleSchema);

export type RolesPage = z.infer<typeof rolesPageSchema>;

// Fetch the first page of roles. Same `apiUrl` + validate pattern as users; a
// non-OK response or schema mismatch throws, surfacing as the query's error.
export async function fetchRoles(): Promise<RolesPage> {
  const response = await fetch(apiUrl("/roles"));
  if (!response.ok) {
    throw new Error(`Failed to fetch roles: ${response.status}`);
  }
  return rolesPageSchema.parse(await response.json());
}
