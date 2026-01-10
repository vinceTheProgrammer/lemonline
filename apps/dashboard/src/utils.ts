import { createSignal, createEffect, onCleanup } from "solid-js";

export function createDebounced<T>(source: () => T, delay = 200) {
  const [debounced, setDebounced] = createSignal<T>(source());

  createEffect(() => {
    const value = source();
    const timeout = setTimeout(() => {
      setDebounced(() => value);
    }, delay);

    onCleanup(() => clearTimeout(timeout));
  });

  return debounced;
}
