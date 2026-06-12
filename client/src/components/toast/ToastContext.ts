import { createContext, useContext } from "react";

// The four toast flavors, distinguished visually by icon color. success/warning
// are consumed by the delete feature today; error/neutral round out the
// reusable surface.
export type ToastVariant = "success" | "warning" | "error" | "neutral";

export type ToastOptions = {
  variant: ToastVariant;
  message: string;
};

// The imperative enqueue function any feature calls to surface a transient
// message. Provided by ToastProvider.
export type ToastFn = (options: ToastOptions) => void;

// Kept in a separate module from ToastProvider so the provider file exports only
// a component (satisfying react-refresh/only-export-components).
export const ToastContext = createContext<ToastFn | null>(null);

// Returns the `toast({ variant, message })` enqueue function. Throws if used
// outside a ToastProvider so the misconfiguration surfaces immediately.
export function useToast(): ToastFn {
  const toast = useContext(ToastContext);
  if (!toast) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return toast;
}
