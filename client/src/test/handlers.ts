import { http, HttpResponse } from "msw";
import { buildRole, buildUser, pageOf } from "./fixtures";

// Default happy-path network handlers. Individual tests override these with
// `server.use(...)` to exercise loading, error, and empty paths.
export const handlers = [
  http.get("/api/users", () =>
    HttpResponse.json(pageOf(Array.from({ length: 5 }, () => buildUser()))),
  ),
  http.get("/api/roles", () =>
    HttpResponse.json(pageOf(Array.from({ length: 3 }, () => buildRole()))),
  ),
];
