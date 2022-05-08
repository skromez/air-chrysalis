<script lang="ts">
  import { get } from 'svelte/store';
  import auth from '../stores/auth';
  import cards from '../stores/cards';

  import { MetadataService } from '../services/metadata.service';
  import { IndexerService } from '../services/indexer.service';

  import Card from '../components/card.svelte'
  import Button from "@smui/button";

  const fetchCards = async () => {
    const {tokenIds, contractAddress} = await IndexerService.getTokenIDs(get(auth).address)
    const metadata = await MetadataService.getMetadata(tokenIds, contractAddress)
    cards.set(metadata)
  }

  auth.subscribe(async (value) => {
    if (value.connected) {
      await fetchCards()
    }
  })
</script>
<svelte:head>
    <title>Air Crhysalis</title>
</svelte:head>
<Button variant="outlined">Create Giveaway</Button>
{#if $cards.length}
    <div class="text-center pb-4">Available Cards:</div>
    <div class="mx-auto p-4 grid border-sky-900 rounded grid-flow-row grid-cols-3 gap-4 border-2 w-3/4 max-w-[850px] max-h-[725px] overflow-y-auto">
        {#each $cards as card}
            <Card imageSrc={card.image} />
        {/each}
    </div>
{/if}
