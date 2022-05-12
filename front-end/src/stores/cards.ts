import { Writable, writable } from "svelte/store";
import type { Card } from '../types/card';

export const cards: Writable<Card[]> = writable([])
