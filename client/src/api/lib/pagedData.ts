import { z } from "zod";

// The server's `PagedData<T>` envelope (server/src/models/paged-data.ts).
// Builds a schema for a page of `item`s. Pagination fields are validated so a
// malformed payload is rejected; only `data` is surfaced for now.
export function pagedSchema<T extends z.ZodTypeAny>(item: T) {
  return z.object({
    data: z.array(item),
    next: z.number().nullable(),
    prev: z.number().nullable(),
    pages: z.number(),
  });
}
