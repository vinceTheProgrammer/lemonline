import { createSignal } from "solid-js";

export const [authVersion, bumpAuth] = createSignal(0);