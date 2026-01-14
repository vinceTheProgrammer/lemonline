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

export type EditorMode = "compact" | "full";

export function createMediaQuery(query: string) {
  const mql = window.matchMedia(query);
  const [matches, setMatches] = createSignal(mql.matches);

  const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
  mql.addEventListener("change", handler);

  onCleanup(() => mql.removeEventListener("change", handler));

  return matches;
}
