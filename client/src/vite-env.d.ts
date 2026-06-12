/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Base origin for API requests. Defaults to the current origin locally (Vite
  // proxies `/api/*` to the server, keeping requests same-origin); set it to
  // point the client at an API on a different host. Vite only exposes env vars
  // prefixed with `VITE_`.
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
