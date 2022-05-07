import { writable } from "svelte/store";

const auth = writable({
  address: '',
  connected: false,
  jwt: ''
});

export default auth;
