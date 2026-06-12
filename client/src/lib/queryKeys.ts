// Centralized query keys so caching, deduping, and invalidation stay
// consistent across hooks and components.
export const queryKeys = {
  users: ["users"],
  roles: ["roles"],
} as const;
