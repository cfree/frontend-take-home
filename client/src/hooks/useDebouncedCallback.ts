import { useCallback, useEffect, useRef } from "react";
import debounce from "lodash.debounce";

type DebouncedFn<Args extends unknown[]> = ReturnType<
  typeof debounce<(...args: Args) => void>
>;

// Wrap a callback in a debounced trigger (lodash.debounce) that survives
// re-renders and cancels any pending invocation on unmount, so a settled call
// never fires after the component is gone. The latest `callback` is held in a
// ref and the debounced function is (re)built inside an effect — never during
// render — so the returned trigger keeps a stable identity while always
// invoking the freshest closure.
export function useDebouncedCallback<Args extends unknown[]>(
  callback: (...args: Args) => void,
  delay: number,
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedRef = useRef<DebouncedFn<Args> | null>(null);

  useEffect(() => {
    const debounced = debounce(
      (...args: Args) => callbackRef.current(...args),
      delay,
    );
    debouncedRef.current = debounced;
    return () => debounced.cancel();
  }, [delay]);

  // Stable trigger that forwards to the current debounced function. Reads the
  // ref only when called (an event-handler context), never during render.
  return useCallback((...args: Args) => {
    debouncedRef.current?.(...args);
  }, []);
}
