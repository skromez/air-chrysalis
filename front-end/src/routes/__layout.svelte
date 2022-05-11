<script lang="ts">
  import '../styles/_global.scss'
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
