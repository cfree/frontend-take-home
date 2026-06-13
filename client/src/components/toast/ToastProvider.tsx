import {
  useCallback,
  useRef,
  useState,
  type ComponentType,
  type FC,
  type ReactNode,
} from "react";
import * as Toast from "@radix-ui/react-toast";
import {
  CheckCircledIcon,
  CrossCircledIcon,
  Cross2Icon,
  ExclamationTriangleIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { Flex, IconButton, Text } from "@radix-ui/themes";

import {
  ToastContext,
  type ToastOptions,
  type ToastVariant,
} from "./ToastContext";

import "./toast.css";

type ActiveToast = ToastOptions & { id: number };

interface ToastProviderProps {
  children: ReactNode;
}

// Per-variant icon + accent color. The color is the cue that distinguishes the
// four variants at a glance; Radix Themes surfaces it as `data-accent-color`.
const VARIANT_STYLES: Record<
  ToastVariant,
  { Icon: ComponentType; color: "green" | "amber" | "red" | "gray" }
> = {
  success: { Icon: CheckCircledIcon, color: "green" },
  warning: { Icon: ExclamationTriangleIcon, color: "amber" },
  error: { Icon: CrossCircledIcon, color: "red" },
  neutral: { Icon: InfoCircledIcon, color: "gray" },
};

// Mounts the Radix Toast primitive's Provider + Viewport once and hands every
// descendant an imperative `toast()` via context. Toasts stack (Radix default)
// and each manages its own auto-dismiss.
export const ToastProvider: FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const nextId = useRef(0);

  const toast = useCallback((options: ToastOptions) => {
    setToasts((current) => [...current, { ...options, id: nextId.current++ }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      <Toast.Provider>
        {children}
        {toasts.map((t) => {
          const { Icon, color } = VARIANT_STYLES[t.variant];
          return (
            <Toast.Root
              key={t.id}
              className="ToastRoot"
              type="foreground"
              onOpenChange={(open) => {
                if (!open) {
                  dismiss(t.id);
                }
              }}
            >
              <Flex align="center" gap="2">
                <Text color={color} asChild>
                  {/* Decorative: the message text conveys the meaning. */}
                  <span aria-hidden="true">
                    <Icon />
                  </span>
                </Text>
                <Toast.Description>{t.message}</Toast.Description>
                <Toast.Close asChild>
                  <IconButton
                    variant="ghost"
                    color="gray"
                    size="1"
                    aria-label="Dismiss"
                  >
                    <Cross2Icon />
                  </IconButton>
                </Toast.Close>
              </Flex>
            </Toast.Root>
          );
        })}
        <Toast.Viewport className="ToastViewport" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
};
