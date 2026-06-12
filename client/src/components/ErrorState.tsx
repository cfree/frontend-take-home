import { Callout } from "@radix-ui/themes";

// Reusable inline error state for an async surface. `role="alert"` so assistive
// tech announces it. Deliberately offers no manual retry control — the query
// client retries automatically against the flaky backend.
export function ErrorState({
  message = "Something went wrong.",
}: {
  message?: string;
}) {
  return (
    <Callout.Root color="red" role="alert">
      <Callout.Text>{message}</Callout.Text>
    </Callout.Root>
  );
}
