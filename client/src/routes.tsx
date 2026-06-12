import { Navigate, Route, Routes } from "react-router";
import { AdminLayout } from "./pages/AdminLayout";
import { UsersPage } from "./pages/UsersPage";
import { RolesPage } from "./pages/RolesPage";

// The admin area's route tree, shared by the app entry and tests. A layout
// route renders the shared shell; Users and Roles are child routes rendered
// through its outlet. Visiting the root lands on the Users tab.
export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/users" replace />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="roles" element={<RolesPage />} />
      </Route>
    </Routes>
  );
}
