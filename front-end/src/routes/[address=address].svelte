<script lang="ts">
  import { onMount } from 'svelte';
  import { fetchAccountGiveawayIds, fetchGiveawayDetails } from '../shared/contract';
  import { page } from '$app/stores';
  import type { Giveaway } from '../types/giveaway';
  import GiveawayCard from '../components/giveaway-card.svelte'

  let address: string;

  page.subscribe(({params}) => {
    address = params.address
  })

  let giveaways: Giveaway[];
  let giveawayIds: number[];
  let loading = true;

  $: onMount(async () => {
    giveawayIds = await fetchAccountGiveawayIds(address)
    giveaways = await Promise.all(giveawayIds.map(async (id) => {
      return await fetchGiveawayDetails(address, id)
    }))
    console.log(giveaways)
    loading = false;
  })
</script>
{#if loading}
    Loading...
{:else if giveaways.length === 0}
    No giveaways...
{:else if giveaways.length}
    <div class="grid grid-flow-row grid-cols-3">
        {#each giveaways as giveaway}
            <GiveawayCard giveaway={giveaway} address={address}>
            </GiveawayCard>
        {/each}
    </div>
{/if}
