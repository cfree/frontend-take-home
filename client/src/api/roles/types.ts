import { z } from "zod";
import { pagedSchema } from "~/lib/pagedData";

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
