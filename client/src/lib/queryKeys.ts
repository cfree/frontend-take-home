// Centralized query keys so caching, deduping, and invalidation stay
// consistent across hooks and components. The users key incorporates the
// active search term so each distinct search is its own cache entry, deduped
// and invalidatable independently.
export const queryKeys = {
  users: (search = "") => ["users", { search }] as const,
  roles: ["roles"],
} as const;
