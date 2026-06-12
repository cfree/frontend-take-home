import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";

// https://vite.dev/config/ and https://vitest.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "~": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  server: {
    // The runs on :3002 (CORS-enabled). We proxy instead of
    // calling it cross-origin so app code fetches same-origin relative paths
    // with no hard-coded host/port in the app layer.
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        // API routes are mounted at the root, so strip
        // the `/api` namespace before forwarding.
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
