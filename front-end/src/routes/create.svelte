<script lang="ts">
    import { cards } from '../stores/cards';
    import { Signer } from 'ethers';
    import { auth } from '../stores/auth';
    import { contractAddress, contractInterface, defaultContract, skyWeaverAddress } from '../shared/contract';
    import { goto } from '$app/navigation';
    import CreateCard from '../components/create-card.svelte'
    import Button from '@smui/button';
    import { onMount } from 'svelte';
    import Container from '../components/container.svelte';
    import CircularProgress from '@smui/circular-progress';

    let loading = false;

    const createGiveaway = async () => {
      const signer: Signer = $auth.signer;
      const selectedCards = $cards.filter((card) => card.selected).map((card) => [card.tokenId, card.selectedAmount])
      const data = contractInterface.encodeFunctionData(
        'createGiveaway', [skyWeaverAddress, selectedCards]
      )
      const transaction = {
        to: contractAddress,
        data
      }
      loading = true
      try {
        const txnResponse = await signer.sendTransaction(transaction)
        await txnResponse.wait()
      } catch (err) {
        loading = false
      }
    }

    $: onMount(async () => {
      if ($cards.filter((card) => card.selected).length === 0) {
        await goto('/assets');
      }
    });

    const onRemoveCard = async (event) => {
      const tokenId = event.detail;
      cards.update((prev) => prev
        .map((card) => card.tokenId=== tokenId ? {...card, selected: false} : card))

      if ($cards.every((card) => !card.selected)) {
        await goto('/assets')
      }
    }

    defaultContract.on('giveawayCreated', async (account, giveawayId) => {
      if (account.toLowerCase() === $auth.address.toLowerCase()) {
        cards.update((cards) => cards.map((card) => ({...card, selected: false, selectedAmount: 1})))
        await goto(`${account}/${giveawayId}`)
      }
    })
</script>
{#if !loading}
    <div class="mx-auto max-w-[720px] flex flex-col items-center">
        {#each $cards.filter((card) => card.selected) as card (card.tokenId)}
            <CreateCard on:removeCard={onRemoveCard} card={card}/>
        {/each}
        {#if $cards.filter((card) => card.selected).length}
            <Button disabled={$cards.every((card) => card.selected)} on:click={async () => await goto('/assets')} ripple={false} class="button-shaped-round w-full py-6 normal-case text-base mb-4" variant="raised">Add more cards</Button>
            <Button on:click={createGiveaway} ripple={false} class="button-shaped-round w-full py-6 normal-case text-base" variant="raised">Continue</Button>
        {/if}
    </div>
{:else}
<Container>
    <CircularProgress style="height: 120px; width: 120px;" indeterminate />
</Container>
{/if}
