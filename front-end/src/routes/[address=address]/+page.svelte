<script lang="ts">
  import { onDestroy, onMount } from 'svelte';
  import {fetchAccountGiveaways} from '../../shared/contract';
  import { page } from '$app/stores';
  import GiveawayCard from '../../components/giveaway-card.svelte'
  import Container from '../../components/container.svelte'
  import CircularProgress from "@smui/circular-progress";
  import { giveaways } from "../../stores/giveaways";

  let address: string;

  const pageSubDestroy = page.subscribe(({params}) => {
    address = params.address
  })

  let loading = true;

  $: onMount(async () => {
    giveaways.set(await fetchAccountGiveaways(address));
    loading = false;
  })

  onDestroy(() => {
    pageSubDestroy();
  })
</script>
{#if loading}
  <Container>
    <CircularProgress style="height: 120px; width: 120px;" indeterminate />
  </Container>
{:else if $giveaways.length === 0}
  <Container>
    No giveaways yet!
  </Container>
{:else if $giveaways.length}
  <div class="grid grid-flow-row grid-cols-3">
    {#each $giveaways as giveaway}
      <GiveawayCard giveaway={giveaway} address={address}>
      </GiveawayCard>
    {/each}
  </div>
{/if}
