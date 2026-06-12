import { Navigate, Route, Routes } from "react-router";
import { AdminLayout } from "./pages/AdminPage";
import UsersTab from "./pages/AdminPage/users/UsersTab";
import RolesTab from "./pages/AdminPage/roles/RolesTab";

// The admin area's route tree, shared by the app entry and tests. A high-level
// error boundary wraps the shared shell as a last-resort safety net for
// unexpected render-time crashes
export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<Navigate to="/users" replace />} />
        <Route path="users" element={<UsersTab />} />
        <Route path="roles" element={<RolesTab />} />
      </Route>
    </Routes>
  );
}
