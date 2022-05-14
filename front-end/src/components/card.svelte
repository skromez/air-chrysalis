<script lang="ts">
    import type { Card } from '../types/card';
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();

    export let card: Card;
    function markSelected() {
      dispatch('done', card.tokenId);
    }
    const silverUrl = 'https://assets.skyweaver.net/t2UR342M/webapp/icons/silver-card-with-letter.png';
    const goldUrl = 'https://assets.skyweaver.net/q2bnNi2F/webapp/icons/gold-card-with-letter.png';
</script>
<div class:selected={card.selected} class="relative rounded-2xl p-4 flex flex-col card text-center">
        <img on:click={markSelected} class="hover:cursor-pointer relative z-10 h-[220px]" src={card.image} alt="Skyweaver Card">
        <div class="flex justify-center items-center">
            <img style="width: 20px; height: 20px" src={card.properties.type === 'Gold' ? goldUrl : silverUrl} alt="Amount Icon">
            <span class="mx-1">
                {card.amount}
            </span>
            <span class="text-bright-purple">
                owned
            </span>
        </div>
        {#if card.selected}
            <img class="h-[225px] left-[14px] top-[19px] z-0 absolute" src="https://assets.skyweaver.net/fn_QTMPm/webapp/cards/full-cards/frame-highlight.png" alt="">
        {/if}
</div>
