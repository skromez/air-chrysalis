import { Writable, writable } from "svelte/store";
import type { Card } from '../types/card';

const auth: Writable<Card[]> = writable([])

export default auth;
