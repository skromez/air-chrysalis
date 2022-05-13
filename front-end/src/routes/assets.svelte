<script lang="ts">
  import Tooltip, { Wrapper } from '@smui/tooltip';
  import Button from '@smui/button';
  import { get } from 'svelte/store';

  import { auth } from '../stores/auth';
  import { cards } from '../stores/cards';

  import { IndexerService } from '../services/indexer.service';
  import { MetadataService } from '../services/metadata.service';
  import Card from '../components/card.svelte';
  import { contractAddress, contractInterface, defaultContract, skyWeaverAddress } from '../shared/contract';
  import { goto } from '$app/navigation';

  let loading = false;
  const fetchCards = async () => {
    const {tokenIds, contractAddress} = await IndexerService.getTokenIDs($auth.address)
    const metadata = await MetadataService.getMetadata(tokenIds, contractAddress)
    // cards.set(metadata)
    loading = false;
  }

  const authUnsub = auth.subscribe(async (value) => {
    if (value.connected) {
      loading = true;
      await fetchCards()
      authUnsub();
    }
  })

  const onSelect = (event) => {
    const tokenId = event.detail;
    cards.update((prev) => prev
      .map((card) => card.tokenId === tokenId ? {...card, selected: !card.selected} : card))
  }

  let buttonDisabled = true;
  cards.subscribe((value) => {
    buttonDisabled = value.filter((card) => card.selected).length === 0
  });

  const createGiveaway = async () => {
    const signer = $auth.signer;
    const selectedCards = $cards.filter((card) => card.selected).map((card) => Number(card.tokenId))
    const data = contractInterface.encodeFunctionData(
      'createGiveaway', [skyWeaverAddress, selectedCards]
    )
    const transaction = {
      to: contractAddress,
      data
    }
    const txnResponse = await signer.sendTransaction(transaction)
    await txnResponse.wait()
  }

  defaultContract.on('giveawayCreated', async (account, giveawayId) => {
    console.log('==== GIVEAWAY CREATED ====')
    console.log(account, 'account');
    console.log(giveawayId, 'giveawayId');
    if (account.toLowerCase() === get(auth).address.toLowerCase()) {
      await goto(`/draw/${account}/${giveawayId}`)
    }
  })

</script>
{#if !$auth.connected}
    Pleaes connect wallet to get access to the inventory
{:else if !loading}
    <div class="px-36">
        <div class="text-center pb-4">Available Cards</div>
        <div class="border-sky-900 rounded-2xl p-4 grid gap-y-4 grid-flow-row grid-cols-[repeat(auto-fill,_175px)] justify-center justify-items-center border-2 max-h-[525px] overflow-y-auto">
            {#each $cards as card}
                <Card on:done={onSelect} card={card} />
            {/each}
        </div>
        <div class="mt-2">
            <Wrapper>
                <div class="inline-block hover:cursor-pointer">
                    <Button on:click={createGiveaway} disabled={buttonDisabled} class="button-shaped-round" variant="raised">Create Giveaway</Button>
                </div>
                {#if buttonDisabled}
                    <Tooltip>Select assets to start giveaway</Tooltip>
                {/if}
            </Wrapper>
            <Button on:click={() => goto(`/${$auth.address}`)} class="button-shaped-round" variant="raised">My Giveaways</Button>
        </div>
    </div>
{:else if loading}
    Fetching cards...
{/if}
