<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import Button from '@smui/button';

  import { auth } from '../stores/auth';
  import { cards } from '../stores/cards';

  import { IndexerService } from '../services/indexer.service';
  import { MetadataService } from '../services/metadata.service';
  import Card from '../components/card.svelte';
  import Container from '../components/container.svelte';
  import CircularProgress from '@smui/circular-progress';
  import { goto } from '$app/navigation';
  import { onDestroy } from 'svelte';

  let loading = !$cards.length;
  const fetchCards = async () => {
    const tokenIds = await IndexerService.getTokenIDs($auth.address)
    if (tokenIds.length > 50) {
      cards.set([]);
      let tokensLeft = tokenIds.length;
      let offset = 0
      let chunkSize = 50;
      while (tokensLeft > 0) {
        let slice = tokenIds.map((token) => token.tokenId).slice(offset, chunkSize);
        const metadata = await MetadataService.getMetadata(slice)
        const amountTokenMap = new Map(tokenIds.map((token) => [token.tokenId, token.amount]))
        const fetchedCards = metadata.map((token) => ({
          ...token,
          amount: amountTokenMap.get(token.tokenId),
          selectedAmount: 1,
        }))
        cards.update((prev) => [...prev, ...fetchedCards]);
        tokensLeft -= 50
        offset = chunkSize
        chunkSize += 50;
      }
    } else {
      const metadata = await MetadataService.getMetadata(tokenIds.map((token) => token.tokenId))
      const amountTokenMap = new Map(tokenIds.map((token) => [token.tokenId, token.amount]))
      const fetchedCards = metadata.map((token) => ({
        ...token,
        amount: amountTokenMap.get(token.tokenId),
        selectedAmount: 1,
      }))
      cards.set(fetchedCards)
    }
    loading = (false);
  }

  const authSubDestroy = auth.subscribe(async (value) => {
    if (value.connected) {
      if ($cards.length === 0) {
        await fetchCards()
      }
    }
  })

  const onSelect = (event) => {
    const tokenId = event.detail;
    cards.update((prev) => prev
      .map((card) => card.tokenId === tokenId ? {...card, selected: !card.selected} : card))
  }

  let buttonDisabled = true;
  const cardSubDestroy = cards.subscribe((value) => {
    buttonDisabled = value.filter((card) => card.selected).length === 0
  })

  onDestroy(() => {
    cardSubDestroy();
    authSubDestroy();
  })
</script>
{#if !$auth.connected}
    <Container>Please connect wallet to get access to your cards</Container>
{:else if $cards.length === 0 && !loading}
    <Container>You don't have any Skyweaver Cards</Container>
{:else if !loading}
    <div class="px-36">
        <div class="text-center text-2xl pb-4 mt-2">Available Cards</div>
        <div class="border-des-purple rounded-2xl p-4 pb-8 grid gap-y-4 grid-flow-row grid-cols-[repeat(auto-fill,_175px)] justify-center justify-items-center border-2 max-h-[525px] overflow-y-auto">
            {#each $cards as card}
                <Card on:selected={onSelect} card={card} />
            {/each}
        </div>
        <div class="mt-4 flex justify-between">
            <Wrapper>
                <div class="inline-block hover:cursor-pointer">
                    <Button ripple={false} on:click={() => goto('/create')} disabled={buttonDisabled} class="button-shaped-round" variant="raised">
                        <span class="text-white">
                            Create Giveaway
                        </span>
                    </Button>
                </div>
                {#if buttonDisabled}
                    <Tooltip>Select assets to start giveaway</Tooltip>
                {/if}
            </Wrapper>
            <Button ripple={false} on:click={() => goto(`/${$auth.address}`)} class="button-shaped-round" variant="raised">
                <span class="text-white">
                    My Giveaways
                </span>
            </Button>
        </div>
    </div>
{:else if loading}
    <Container>
        <CircularProgress style="height: 120px; width: 120px;" indeterminate />
    </Container>
{/if}
