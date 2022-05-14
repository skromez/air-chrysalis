<script lang="ts">
  import Card, { Content } from "@smui/card";
  import Button from "@smui/button";
  import type { Card as SkyCard } from '../types/card'

  export let card: SkyCard;

  let amount = 1;

  const increase = () => {
    if (amount < card.amount) {
      amount++
    }
  }
  const decrease = () => {
    if (amount > 1) {
      amount--
    }
  }

  const setMaxAmount = () => {
    amount = card.amount;
  }
</script>
<Card class="m-4 p-3 rounded-2xl w-full">
    <Content class="flex items-center">
        <div class="card-image-container">
            <img class="card-image" src={card.image} alt="Card Image">
        </div>
        <div class="flex flex-col ml-4">
            <span class="text-base">{card.name}</span>
            <span class="text-sm text-gray-400">Balance: {card.amount}</span>
        </div>
    </Content>
    <Content class="rounded-2xl border-des-purple border-solid border flex justify-between items-center">
        <div class="flex justify-center items-center">
            <Button disabled={amount === 1} on:click={decrease} ripple={false} variant="raised" class="button-shaped-round min-w-[12px] w-[24px] h-[25px]">-</Button>
            <div class="mx-4 text-2xl flex items-center gap-1">
                <span>{amount}</span>
                <span class="text-xl text-gray-500"> / {card.amount}</span>
            </div>
            <Button disabled={amount === card.amount} on:click={increase} ripple={false} variant="raised" class="button-shaped-round min-w-[12px] w-[24px] h-[25px]">+</Button>
        </div>
        <Button disabled={amount === card.amount} on:click={setMaxAmount} ripple={false} variant="raised" class="text-xs button-shaped-round min-w-[42px] w-[42px] h-[25px] normal-case">Max</Button>
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
