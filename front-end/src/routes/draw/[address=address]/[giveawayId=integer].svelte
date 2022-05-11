<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { auth } from '../../../stores/auth';
  import { contractAddress, contractInterface, defaultProvider } from '../../../shared/contract';
  import type { Giveaway } from '../../../types/giveaway';

  let address: string;
  let giveawayId: number;
  let giveaway: Giveaway

  const fetchGiveaway = async (): Promise<Giveaway> => {
    const data = contractInterface.encodeFunctionData('getAccountGiveaway', [address, giveawayId])
    const transaction = {
      to: contractAddress,
      data: data
    }
    const txnResponse = await defaultProvider.call(transaction)
    const decoded = contractInterface.decodeFunctionResult('getAccountGiveaway', txnResponse)
    console.log(decoded)
    return {
      participants: decoded.giveaway.participants,
      contractAddr: decoded.giveaway.contractAddr,
      finished: decoded.giveaway.finished,
      tokenIds: decoded.giveaway.tokenIds,
    }
  }

  page.subscribe(({params}) => {
    address = params.address
    giveawayId = Number(params.giveawayId)
  })

  $: onMount(async () => {
    giveaway = await fetchGiveaway()
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
