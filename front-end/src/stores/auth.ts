import { writable, type Writable } from "svelte/store";
import type { AuthStore } from "../types/auth-store";

export const auth: Writable<AuthStore> = writable({
	address: "",
	connected: false,
	jwt: ""
});
