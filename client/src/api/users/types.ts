import { z } from "zod";
import { pagedSchema } from "~/lib/pagedData";

// Mirrors the server's `User` model (server/src/models/user.ts). Parsing the
// response with a schema — rather than trusting the JSON — is part of handling
// a backend that handles server issues and network latency gracefully.
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
