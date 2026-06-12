import type { FC } from "react";
import { VisuallyHidden } from "@radix-ui/themes";

interface ResultsAnnouncerProps {
  // Result count once the query has settled, or null while it is pending —
  // null keeps the region empty, so loading is left to the skeleton's own
  // status role and the announcement isn't chatty.
  count: number | null;
  // Singular noun for the counted thing (e.g. "user" → "1 user / 2 users").
  noun: string;
}

function announcement(count: number | null, noun: string): string {
  if (count === null) {
    return "";
  }
  if (count === 0) {
    return `No ${noun}s found`;
  }
  return `${count} ${count === 1 ? noun : `${noun}s`} found`;
}

// A persistent, visually-hidden polite live region that announces a settled
// result count to assistive tech ("N users found" / "No users found"). Mount it
// ahead of (and keep it mounted across) an async surface's loading/empty/error
// branches so its text changes are reliably announced; it stays silent while
// pending because the count is null. Reusable across any searchable list.
export const ResultsAnnouncer: FC<ResultsAnnouncerProps> = ({
  count,
  noun,
}) => {
  return (
    <VisuallyHidden role="status">{announcement(count, noun)}</VisuallyHidden>
  );
};
