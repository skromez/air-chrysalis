<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import Button from '@smui/button';
  import { get } from 'svelte/store';

  import { auth } from '../stores/auth';
  import cards from '../stores/cards';

  import { IndexerService } from '../services/indexer.service';
  import { MetadataService } from '../services/metadata.service';
  import Card from '../components/card.svelte';

  const fetchCards = async () => {
    const {tokenIds, contractAddress} = await IndexerService.getTokenIDs(get(auth).address)
    const metadata = await MetadataService.getMetadata(tokenIds, contractAddress)
    cards.set(metadata)
  }

  const authUnsub = auth.subscribe(async (value) => {
    if (value.connected) {
      await fetchCards()
      authUnsub();
    }
  })
</script>
{#if !$auth.connected}
    Pleaes connect wallet to get access to the inventory
{:else if $cards.length}
    <div class="px-[100px]">
        <div class="text-center pb-4">Available Cards:</div>
        <div class="mx-auto p-4 grid border-sky-900 rounded grid-flow-row grid-cols-3 gap-4 border-2 max-h-[725px] overflow-y-auto">
            {#each $cards as card}
                <Card imageSrc={card.image} />
            {/each}
        </div>
        <Wrapper>
            <div class="inline-block hover:cursor-pointer">
                <Button disabled={true} class="button-shaped-round" variant="raised">create giveaway</Button>
            </div>
            {#if true}
                <Tooltip>Select assets to start giveaway</Tooltip>
            {/if}
        </Wrapper>
    </div>
{:else}
    Fetching cards...
{/if}
