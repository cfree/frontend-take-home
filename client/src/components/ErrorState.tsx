import { type FC } from "react";
import { Callout } from "@radix-ui/themes";

interface ErrorStateProps {
  message?: string;
}

// Reusable inline error state for an async surface. `role="alert"` so assistive
// tech announces it.
export const ErrorState: FC<ErrorStateProps> = ({
  message = "Something went wrong.",
}) => {
  return (
    <Callout.Root color="red" role="alert">
      <Callout.Text>{message}</Callout.Text>
    </Callout.Root>
  );
};
