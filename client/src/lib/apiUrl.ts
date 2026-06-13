// Base origin for API requests. `VITE_API_URL` overrides it for deploys where
// the API lives on a different host; locally it defaults to the current origin
// (Vite proxies `/api/*` to the server, so requests stay same-origin).
const API_BASE =
  import.meta.env.VITE_API_URL ?? `${window.location.origin}/api`;

// Build an absolute URL for an API path. Absolute (rather than relative) so
// Node's fetch accepts it under jsdom in tests, while still deriving the origin
// rather than hard-coding a host.
export function apiUrl(path: string): URL {
  return new URL(`${API_BASE}${path}`);
}
