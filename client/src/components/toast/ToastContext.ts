import { createContext } from "react";

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
