<script lang="ts">
  import type {Card as SkyweaverCard} from "../types/card";

  export let winner: {address: string, items: SkyweaverCard[]};
  export let idx: number;

  const isItemIsCard = (item: SkyweaverCard) => {
    return item.properties.type === 'Gold' || item.properties.type === 'Silver'
  }

  const itemClick = async (card: SkyweaverCard) => {
    if (isItemIsCard(card)) {
      const url = `https://play.skyweaver.net/items/cards/${card.properties.baseCardId}/${card.properties.type === 'Gold' ? 'gold' : 'silver'}`
      window.open(url, '_blank')
    }
  }

</script>
<div class="text-left p-4 flex justify-between gap-4">
  <span class="block mb-2 flex flex-col justify-between">
    Winner {idx + 1}
    <a target="_blank" href={`https://polygonscan.com/address/${winner.address}`}>{winner.address.slice(0,18)}...{winner.address.slice(-4)}</a>
  </span>
  <div class="flex gap-2 flex-wrap max-h-[90px] overflow-y-auto justify-center">
    {#each winner.items as card}
      <div class:cursor-pointer={isItemIsCard(card)} on:click={() => itemClick(card)} class="text-center cursor-pointer w-[60px]">
        <img style="height: 80px;" src={card.image} alt="Card">
      </div>
    {/each}
  </div>
</div>