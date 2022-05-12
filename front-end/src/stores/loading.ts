import { Writable, writable } from "svelte/store";

export const loading: Writable<boolean> = writable(false);
