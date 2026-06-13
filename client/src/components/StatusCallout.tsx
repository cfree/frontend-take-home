import { type ComponentType, type FC } from "react";
import { Callout } from "@radix-ui/themes";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import type { ToastVariant } from "./toast/ToastContext";

interface StatusCalloutProps {
  variant: ToastVariant;
  message: string;
}

// Per-variant icon, Radix accent color, and ARIA role. Problems (error/warning)
// announce assertively; positive/neutral notices announce politely. Mirrors the
// toast system's Radix icon mapping so the two surfaces read consistently.
const VARIANT_STYLES: Record<
  ToastVariant,
  {
    Icon: ComponentType;
    color: "red" | "amber" | "gray" | "green";
    role: "alert" | "status";
  }
> = {
  error: { Icon: CrossCircledIcon, color: "red", role: "alert" },
  warning: { Icon: ExclamationTriangleIcon, color: "amber", role: "alert" },
  neutral: { Icon: InfoCircledIcon, color: "gray", role: "status" },
  success: { Icon: CheckCircledIcon, color: "green", role: "status" },
};

// Inline status callout: a Radix Callout carrying a variant-appropriate icon,
// accent color, and ARIA role. Shares the status taxonomy (success / warning /
// error / neutral) with the toast system.
export const StatusCallout: FC<StatusCalloutProps> = ({ variant, message }) => {
  const { Icon, color, role } = VARIANT_STYLES[variant];

  return (
    <Callout.Root color={color} role={role}>
      <Callout.Icon>
        {/* Decorative: the message text conveys the meaning. */}
        <span aria-hidden="true">
          <Icon />
        </span>
      </Callout.Icon>
      <Callout.Text>{message}</Callout.Text>
    </Callout.Root>
  );
};
