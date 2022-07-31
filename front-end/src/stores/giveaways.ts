import { type Writable, writable } from "svelte/store";
import type { Giveaway } from "../types/giveaway";

export const giveaways: Writable<Giveaway[]> = writable([])
