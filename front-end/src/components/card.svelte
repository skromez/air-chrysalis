<script lang="ts">
    import type { Card } from '../types/card';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let card: Card;
    function markSelected() {
      dispatch('done', card.tokenId);
    }
</script>
<div class:selected={card.selected}
     on:click={markSelected}
     class="rounded-2xl p-4 min-w-[150px] w-[150px] hover:cursor-pointer flex flex-col card"
>
    <img src={card.image} alt="Skyweaver Card">
    <span class="text-xs text-center">{card.name}</span>
</div>
<style>
    .card {
        background-color: #0C061E;
    }
    .selected {
        background-color: #231445;
    }
</style>
