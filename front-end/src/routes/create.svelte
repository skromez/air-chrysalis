<script lang="ts">
    import { cards } from '../stores/cards';
    import { Signer } from 'ethers';
    import { auth } from '../stores/auth';
    import { contractAddress, contractInterface, defaultContract, skyWeaverAddress } from '../shared/contract';
    import { goto } from '$app/navigation';
    import CreateCard from '../components/create-card.svelte'
    import Button from "@smui/button";

    const selectedCards = $cards.filter((card) => card.selected)

    const createGiveaway = async () => {
      const signer: Signer = $auth.signer;
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
      if (account.toLowerCase() === $auth.address.toLowerCase()) {
        await goto(`${account}/${giveawayId}`)
      }
    })
</script>
<div class="mx-auto max-w-[720px] flex flex-col items-center">
    {#each selectedCards as card (card.tokenId)}
        <CreateCard card={card}/>
    {/each}
    <Button class="button-shaped-round w-full py-6 normal-case text-base" variant="raised">Continue</Button>
</div>
