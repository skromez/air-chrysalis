<script lang="ts">
  import auth from '../stores/auth';
  import axios from 'axios';
  import { get } from 'svelte/store';
  import { api } from '../shared/api';
  import cards from '../stores/cards';

  const getMetadata = async (tokenIDs: string[]) => {
    const {data: {tokenMetadata}} = await axios.post(`${api.metadata}/GetTokenMetadata`, {
      chainID: '137',
      contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e',
      tokenIDs
    })
    cards.set(tokenMetadata)
  }

  const getTokenBalances = async () => {
    const {data: {balances}} = await axios.post(`${api.indexer}/GetTokenBalances`, {
      accountAddress: get(auth).address,
      contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e'
    })
    const tokenIds = balances.map((bal) => bal.tokenID)
    await getMetadata(tokenIds)
  }

  auth.subscribe(async (value) => {
    if (value.connected) {
      await getTokenBalances()
    }
  })
</script>
<svelte:head>
    <title>Air Crhysalis</title>
</svelte:head>
{#each $cards as card}
    <div class="w-1/6">
        <img src={card.image} alt="">
    </div>
{/each}
