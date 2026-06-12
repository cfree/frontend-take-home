import { useState } from "react";
import { Box, Flex } from "@radix-ui/themes";
import { useSearchParams } from "react-router";
import { SearchInput } from "~/components/SearchInput";
import { UsersList } from "~/pages/AdminPage/users/components/UsersList";
import { useDebouncedCallback } from "~/hooks/useDebouncedCallback";

// URL query parameter that holds the active search term, so a filtered view is
// shareable, bookmarkable, and survives refresh / back-button.
const SEARCH_PARAM = "search";

// Debounce window before a settled term is committed to the URL and queried, so
// a burst of keystrokes produces a single trailing request.
const DEBOUNCE_MS = 300;

export default function UsersTab() {
  const [searchParams, setSearchParams] = useSearchParams();
  const committedSearch = searchParams.get(SEARCH_PARAM) ?? "";

  // The raw input value drives the field for instant typing; it hydrates from
  // the URL on mount so a deep link restores both the box and the filter.
  const [inputValue, setInputValue] = useState(committedSearch);

  // Write the settled term to the URL. Trimmed at the ends (internal spaces
  // preserved); an empty-after-trim term drops the param entirely rather than
  // firing a pointless filtered query. `replace` so typing doesn't flood the
  // back stack.
  const commitSearch = useDebouncedCallback((value: string) => {
    const trimmed = value.trim();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (trimmed) {
          next.set(SEARCH_PARAM, trimmed);
        } else {
          next.delete(SEARCH_PARAM);
        }
        return next;
      },
      { replace: true },
    );
  }, DEBOUNCE_MS);

  function handleSearchChange(value: string) {
    setInputValue(value);
    commitSearch(value);
  }

  return (
    <Flex direction="column" gap="4">
      <Flex justify="between" align="center" gap="3">
        <Box width="320px" maxWidth="100%">
          <SearchInput
            value={inputValue}
            onChange={handleSearchChange}
            label="Search users by name"
            placeholder="Search by name…"
          />
        </Box>
        <Box flexShrink="0" />
      </Flex>
      <UsersList search={committedSearch} />
    </Flex>
  );
}
