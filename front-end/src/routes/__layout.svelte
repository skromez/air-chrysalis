<script lang="ts">
  import "../app.css"
  import Header from '../components/header.svelte'
  import { browser } from "$app/env";
  import { onMount } from 'svelte';
  import { sequence } from '0xsequence';
  import { auth } from '../stores/auth';

  $: onMount(async () => {
    const jwt = localStorage.getItem('jwt')
    const wallet = new sequence.Wallet(137)
    const expiresAt = Number(localStorage.getItem('expiresAt'))
    const now = Math.floor(Date.now() / 1000)
    if (jwt && expiresAt > now) {
      await wallet.connect({authorize: false, app: 'Air Chrysalis'})
      const provider = wallet.getProvider()
      auth.set({
        address: await wallet.getAddress(),
        connected: true,
        jwt,
        wallet,
        provider,
        signer: wallet.getSigner(),
      })
    } else {
      localStorage.removeItem('jwt')
      localStorage.removeItem('expiresAt')
    }
  })

</script>
<svelte:head>
    <title>Air Chrysalis</title>
</svelte:head>
<Header />
<div class="px-4 pb-12 pt-2">
    {#if browser}
        <slot></slot>
    {/if}
</div>
