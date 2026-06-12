import { Heading } from "@radix-ui/themes";

// The Users tab. The real users table arrives in a later slice; for now this is
// the routable destination the tab strip points at.
export function UsersPage() {
  return <Heading size="4">Users</Heading>;
}
