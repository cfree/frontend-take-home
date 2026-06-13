// Returns the `toast({ variant, message })` enqueue function. Throws if used

import { useContext } from "react";
import { ToastContext, type ToastFn } from "./ToastContext";

// outside a ToastProvider so the misconfiguration surfaces immediately.
export function useToast(): ToastFn {
  const toast = useContext(ToastContext);
  if (!toast) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return toast;
}
