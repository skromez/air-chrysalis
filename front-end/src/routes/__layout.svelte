<script lang="ts">
  import "../app.css"
  import Header from '../components/header.svelte'
</script>
<svelte:head>
    <title>Air Chrysalis</title>
</svelte:head>
<Header />
<div class="p-4">
    <slot></slot>
</div>
<span class="absolute bottom-2 left-2 text-xs text-des-purple">
    This app is not produced, endorsed, or supported by Horizon Blockchain Games.
</span>
