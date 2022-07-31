<script lang="ts">
  import Card, { Content } from "@smui/card";
  import Button from "@smui/button";
  import type { Card as SkyCard } from '../types/card'
  import { createEventDispatcher } from 'svelte';

  export let card: SkyCard;

  const dispatch = createEventDispatcher();

  const increase = () => {
    if (card.selectedAmount < card.amount) {
      card.selectedAmount++
      dispatch('changeAmount', card.tokenId);
    }
  }
  const decrease = () => {
    if (card.selectedAmount > 1) {
      card.selectedAmount--
      dispatch('changeAmount', card.tokenId);
    }
  }

  const setMaxAmount = () => {
    card.selectedAmount = card.amount;
    dispatch('changeAmount', card.tokenId);
  }

  const removeCard = () => {
    dispatch('removeCard', card.tokenId);
  }
</script>
<Card class="m-4 p-3 rounded-2xl w-full">
  <Content class="flex justify-between relative">
    <div class="flex justify-between">
      <div class="card-image-container">
        <img class="card-image" src={card.image} alt="Card Image">
      </div>
      <div class="flex flex-col ml-4">
        <span class="text-base">{card.name}</span>
        <span class="text-sm text-gray-400">Balance: {card.amount}</span>
      </div>
    </div>
    <button on:click={removeCard} class="cursor-pointer absolute right-[5px] top-[3px] p-2">
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg" class="icon icon-close"><rect width="15.0435" height="2.00581" transform="matrix(0.70506 -0.709147 0.70506 0.709147 0 10.668)" fill="currentcolor"></rect><rect width="15.0435" height="2.00581" transform="matrix(0.70506 0.709147 -0.70506 0.709147 1.41455 0)" fill="currentcolor"></rect></svg>
    </button>
  </Content>
  <Content class="rounded-2xl border-des-purple border-solid border flex justify-between items-center">
    <div class="flex justify-center items-center">
      <Button disabled={card.selectedAmount === 1} on:click={decrease} ripple={false} variant="raised" class="button-shaped-round min-w-[12px] w-[24px] h-[25px]">-</Button>
      <div class="mx-4 text-2xl flex items-center gap-1">
        <span>{card.selectedAmount}</span>
        <span class="text-xl text-gray-500"> / {card.amount}</span>
      </div>
      <Button disabled={card.selectedAmount === card.amount} on:click={increase} ripple={false} variant="raised" class="button-shaped-round min-w-[12px] w-[24px] h-[25px]">+</Button>
    </div>
    <Button disabled={card.selectedAmount === card.amount} on:click={setMaxAmount} ripple={false} variant="raised" class="text-xs button-shaped-round min-w-[42px] w-[42px] h-[25px] normal-case">Max</Button>
  </Content>
</Card>
<style>
    .card-image-container {
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        width: 45px;
        height: 45px;
    }
    .card-image {
        height: auto;
        width: auto;
        max-height: 100%;
        max-width: 100%;
    }
</style>
