import { Writable, writable } from "svelte/store";
import type { Card } from '../types/card';

const cards: Writable<Card[]> = writable([])

export default cards;
