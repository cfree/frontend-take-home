import {
  useRef,
  useState,
  type FC,
  type SubmitEvent,
  type RefObject,
} from "react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Spinner,
  Text,
  TextField,
} from "@radix-ui/themes";
import { ErrorState } from "~/components/ErrorState";
import type { Role } from "~/api/roles/types";

interface RenameRoleDialogProps {
  role: Role;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Called with the trimmed new name when the form is submitted and valid. The
  // parent owns the request and decides when to close.
  onSubmit: (name: string) => void;
  // True while the rename request is outstanding. The Rename/Cancel buttons take
  // a busy state via aria-disabled + aria-busy (not native disabled, so focus
  // stays put) and submission is guarded against double-submit.
  pending?: boolean;
  // Where focus goes when the dialog closes — the parent steers it back to the
  // row's kebab trigger, since the menu that opened this dialog has unmounted.
  onCloseAutoFocus?: (event: Event) => void;
  // A specific inline error to surface (duplicate name, generic failure) while
  // keeping the dialog open for correction; null when there's nothing to show.
  errorMessage?: string | null;
}

// Field id, linking the visible label to the input so the textbox has an
// accessible name ("Role name").
const NAME_FIELD_ID = "rename-role-name";

// Form dialog for renaming a role, built on Radix Themes' Dialog (distinct from
// the destructive AlertDialog used for deletes). The parent controls open state
// and owns the request, so the dialog can stay open while in flight or after a
// failure.
export const RenameRoleDialog: FC<RenameRoleDialogProps> = ({
  role,
  open,
  onOpenChange,
  onSubmit,
  pending = false,
  onCloseAutoFocus,
  errorMessage,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        maxWidth="536px"
        onOpenAutoFocus={(event) => {
          // Take over Radix's default focus so the field opens focused with its
          // text pre-selected, letting the user immediately overwrite it.
          event.preventDefault();
          const input = inputRef.current;
          if (input) {
            input.focus();
            input.select();
          }
        }}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        <Dialog.Title>Rename role</Dialog.Title>
        <Dialog.Description>Change the role name.</Dialog.Description>

        {/* The form's state lives in a child of Dialog.Content, which Radix
            unmounts on close — so the field re-seeds to the current name each
            time the dialog opens without an effect. */}
        <RenameRoleForm
          role={role}
          pending={pending}
          error={errorMessage}
          inputRef={inputRef}
          onSubmit={onSubmit}
        />
      </Dialog.Content>
    </Dialog.Root>
  );
};

interface RenameRoleFormProps {
  role: Role;
  pending: boolean;
  error?: string | null;
  inputRef: RefObject<HTMLInputElement | null>;
  onSubmit: (name: string) => void;
}

// The controlled form body. Initialized once per mount (i.e. once per open), so
// `name` always starts at the current role name. Enter submits; the Rename
// button is gated when the trimmed name is empty, unchanged, or in flight.
const RenameRoleForm: FC<RenameRoleFormProps> = ({
  role,
  pending,
  error,
  inputRef,
  onSubmit,
}) => {
  const [name, setName] = useState(role.name);

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && trimmed !== role.name && !pending;
  // Gated by validation (empty / unchanged), as opposed to busy. We keep
  // aria-disabled rather than the native disabled attribute, so the button needs
  // an explicit muted appearance to read as unavailable to sighted users — while
  // in flight the spinner conveys state instead.
  const showAsDisabled = !canSubmit && !pending;

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault();
    if (canSubmit) {
      onSubmit(trimmed);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Box mt="4">
        <Text as="label" htmlFor={NAME_FIELD_ID} size="2" weight="bold">
          Role name
        </Text>
        <TextField.Root
          id={NAME_FIELD_ID}
          ref={inputRef}
          mt="1"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Box>

      {error && (
        <Box mt="3">
          <ErrorState message={error} />
        </Box>
      )}

      <Flex gap="3" mt="4" justify="end">
        <Dialog.Close>
          <Button
            variant="outline"
            color="gray"
            aria-disabled={pending}
            onClick={(event) => {
              if (pending) {
                event.preventDefault();
              }
            }}
          >
            Cancel
          </Button>
        </Dialog.Close>
        <Button
          type="submit"
          variant="outline"
          aria-disabled={!canSubmit}
          aria-busy={pending}
          style={
            showAsDisabled ? { opacity: 0.5, cursor: "not-allowed" } : undefined
          }
        >
          <Spinner loading={pending} />
          Rename role
        </Button>
      </Flex>
    </form>
  );
};
