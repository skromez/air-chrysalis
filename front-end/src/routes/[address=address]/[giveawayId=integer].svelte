<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import {
    contractAddress,
    contractInterface,
    defaultContract,
    fetchGiveawayDetails
  } from '../../shared/contract';
  import type { Giveaway } from '../../types/giveaway';
  import Button from "@smui/button";
  import { auth } from '../../stores/auth';

  let address: string;
  let giveawayId: number;
  let giveaway: Giveaway

  const finishGiveaway = async () => {
    const data = contractInterface.encodeFunctionData('finishGiveaway', [address, giveawayId])
    const transaction = {
      from: await $auth.signer.getAddress(),
      to: contractAddress,
      data: data
    }
    const txnResponse = await $auth.signer.sendTransaction(transaction)
    await txnResponse.wait();
  }

  const enterGiveaway = async () => {
    const data = contractInterface.encodeFunctionData('enterGiveaway', [address, giveawayId])
    const transaction = {
      from: await $auth.signer.getAddress(),
      to: contractAddress,
      data: data
    }
    const txnResponse = await $auth.signer.sendTransaction(transaction)
    await txnResponse.wait();
  }

  page.subscribe(({params}) => {
    address = params.address
    giveawayId = Number(params.giveawayId)
  })

  $: onMount(async () => {
    giveaway = await fetchGiveawayDetails(address, giveawayId)
  })

  defaultContract.on('giveawayEntered', async (_, __, _giveawayId) => {
    if (_giveawayId == giveawayId) {
      giveaway = await fetchGiveawayDetails(address, giveawayId)
    }
  })
</script>
{#if giveaway}
    <div>
        <div>
            giveawayId: {giveawayId}
        </div>
        <div>
            participants: {giveaway.participants.length}
        </div>
        <div>
            contractAddr: {giveaway.contractAddr}
        </div>
        <div>
            finished: {giveaway.finished}
        </div>
    </div>
{/if}
<div class="mt-4">
{#if !$auth.connected && giveaway}
        If you are the host of the giveaway or want to participate please connect your wallet
{:else if address.toLowerCase() === $auth.address.toLowerCase() && giveaway && !giveaway.finished}
    <Button class="button-shaped-round" on:click={finishGiveaway} variant="raised">Finish Giveaway</Button>
{:else if giveaway}
    <Button class="button-shaped-round" on:click={enterGiveaway} variant="raised">Enter Giveaway</Button>
{/if}
</div>
