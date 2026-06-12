import { Container, Flex, TabNav } from "@radix-ui/themes";
import { Link, Outlet, useLocation } from "react-router";

// The admin area's tab destinations. The URL is the single source of truth for
// the active tab, so these are plain navigation links, not stateful controls.
const TABS = [
  { label: "Users", path: "/users" },
  { label: "Roles", path: "/roles" },
] as const;

// Shared shell for the admin area: a page container, a persistent tab strip
// whose active tab is derived from the current URL, and an outlet the active
// tab's screen renders into.
export function AdminLayout() {
  const { pathname } = useLocation();

  return (
    <Container size="2" p="6">
      <Flex direction="column" gap="4">
        <TabNav.Root aria-label="Admin sections">
          {TABS.map((tab) => (
            <TabNav.Link
              key={tab.path}
              asChild
              active={pathname.startsWith(tab.path)}
            >
              <Link to={tab.path}>{tab.label}</Link>
            </TabNav.Link>
          ))}
        </TabNav.Root>
        <Outlet />
      </Flex>
    </Container>
  );
}
