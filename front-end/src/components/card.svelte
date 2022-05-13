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
     class="relative rounded-2xl p-4 flex flex-col card"
>
        <img on:click={markSelected} class="hover:cursor-pointer relative z-10 h-[220px]" src={card.image} alt="Skyweaver Card">
    {#if card.selected}
        <img class="h-[225px] left-[14px] top-[19px] z-0 absolute" src="https://assets.skyweaver.net/fn_QTMPm/webapp/cards/full-cards/frame-highlight.png" alt="">
    {/if}
</div>
<style>
</style>
