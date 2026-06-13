import { type FC } from "react";
import { StatusCallout } from "./StatusCallout";

interface ErrorStateProps {
  message?: string;
}

// Reusable inline error state for an async surface. A thin specialization of
// StatusCallout on the error variant (red, exclamation icon, role="alert" so
// assistive tech announces it).
export const ErrorState: FC<ErrorStateProps> = ({
  message = "Something went wrong.",
}) => {
  return <StatusCallout variant="error" message={message} />;
};
