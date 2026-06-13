import type { FC } from "react";
import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { TextField } from "@radix-ui/themes";

// Upper bound on the search term — a mild abuse guard, not a validation rule.
const MAX_LENGTH = 100;

interface SearchInputProps {
  // Controlled value of the field.
  value: string;
  // Called with the raw input value on every keystroke.
  onChange: (value: string) => void;
  // Accessible name for the field. Required (not derived from the placeholder),
  // because the placeholder visually disappears once the user types.
  label: string;
  // Visible placeholder shown while the field is empty.
  placeholder?: string;
  // Character cap; defaults to a sensible maximum.
  maxLength?: number;
}

// A dumb, reusable search field. Owns no state; the parent controls its
// value and decides what to do (debounce, URL-sync) with each change. Built to
// be shared.
export const SearchInput: FC<SearchInputProps> = ({
  value,
  onChange,
  label,
  placeholder,
  maxLength = MAX_LENGTH,
}) => {
  return (
    <TextField.Root
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label={label}
      maxLength={maxLength}
    >
      <TextField.Slot>
        <MagnifyingGlassIcon aria-hidden />
      </TextField.Slot>
    </TextField.Root>
  );
};
