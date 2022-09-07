<script lang="ts">
  import { page } from '$app/stores';
  import { onDestroy, onMount } from 'svelte';
  import {
    contractAddress,
    contractInterface,
    defaultContract, fetchAccountGiveaways,
    isParticipatingInGiveaway,
    skyWeaverAddress
  } from '../../../shared/contract';
  import type { Giveaway } from '../../../types/giveaway';
  import type { Card as SkyweaverCard } from "../../../types/card";
  import Container from '../../../components/container.svelte';
  import Winner from '../../../components/winner.svelte';
  import Button from "@smui/button";
  import { auth } from '../../../stores/auth';
  import Card, { Content } from "@smui/card";
  import { MetadataService } from '../../../services/metadata.service';
  import CircularProgress from "@smui/circular-progress";
  import {BigNumber, ethers} from 'ethers';
  import { giveaways } from "../../../stores/giveaways";

  let address: string;
  let cards: SkyweaverCard[] = [];
  let winners: {address: string, items: SkyweaverCard[]}[] = [];
  let loadingCards = true;
  let loadingVRFVerification = false;
  let giveawayId: number;
  let giveaway: Giveaway
  let isParticipating = false;
  let noGiveaway = false;

  const finishGiveaway = async () => {
    const data = contractInterface.encodeFunctionData('finishGiveaway', [address, giveawayId])
    const transaction = {
      from: await $auth.signer.getAddress(),
      to: contractAddress,
      data: data
    }
    const txnResponse = await $auth.signer.sendTransaction(transaction)
    await txnResponse.wait();
    if (giveaway.participants.length > 0) {
      loadingVRFVerification = true;
    }
  }

  const sendPrizes = async () => {
    const erc1155Interface = new ethers.utils.Interface([
      'function safeBatchTransferFrom(address from, address to, uint256[] ids, uint256[] amounts, bytes calldata _data)'
    ])

    const transactions = []
    for (const winner of winners) {
      const tokenIds = []
      const tokenAmounts = []
      for (const token of winner.items) {
        tokenIds.push(BigNumber.from(token.tokenId))
        tokenAmounts.push(BigNumber.from(token.amount * 100))
      }
      const data = erc1155Interface.encodeFunctionData(
        'safeBatchTransferFrom', [$auth.address, winner.address, tokenIds, tokenAmounts, '0x']
      )
      transactions.push({
        to: skyWeaverAddress,
        data
      })
    }

    try {
      const data = contractInterface.encodeFunctionData(
        'prizeSent', [address, giveawayId]
      )

      const transaction = {
        to: contractAddress,
        data
      }

      const txnResponse = await $auth.signer.sendTransactionBatch([...transactions, transaction])
      await txnResponse.wait()
      await refreshGiveaways()
    } catch (err) {
      console.log(err)
    }
  }

  const enterGiveaway = async () => {
    const data = contractInterface.encodeFunctionData('enterGiveaway', [address, giveawayId])
    const transaction = {
      from: await $auth.signer.getAddress(),
      to: contractAddress,
      data: data
    }
    const txnResponse = await $auth.signer.sendTransaction(transaction)
    await txnResponse.wait();
  }

  const pageSubDestroy = page.subscribe(({params}) => {
    address = params.address
    giveawayId = Number(params.giveawayId)
  })

  const fetchCards = async () => {
    const tokensAmountMap = new Map(giveaway.tokenTuples.map((tuple) => [tuple[0].toString(), tuple[1].toNumber()]));
    const tokenIds = giveaway.tokenTuples.map((tuple) => tuple[0].toString());
    if (giveaway.tokenTuples.length > 50) {
      cards = [];
      let tokensLeft = giveaway.tokenTuples.length;
      let offset = 0
      let chunkSize = 50;
      while (tokensLeft > 0) {
        let slice = giveaway.tokenTuples.map((tuple) => tuple[0].toString()).slice(offset, chunkSize);
        const metadata = await MetadataService.getMetadata(slice)
        cards.concat(metadata.map((card) => {
          return {
            ...card,
            amount: tokensAmountMap.get(card.tokenId)
          }
        }))
        tokensLeft -= 50
        offset = chunkSize
        chunkSize += 50;
      }
    } else {
      const metadata = await MetadataService.getMetadata(tokenIds)
      cards = metadata.map((card) => {
        return {
          ...card,
          amount: tokensAmountMap.get(card.tokenId)
        }
      })
    }
    loadingCards = false;
  }

  const refreshGiveaways = async () => {
    giveaways.set(await fetchAccountGiveaways(address));
    giveaway = $giveaways[giveawayId];
  }

  const authSubDestroy = auth.subscribe(async (value) => {
    if (value.connected) {
      if (address.toLowerCase() !== $auth.address.toLowerCase()) {
        isParticipating = await isParticipatingInGiveaway($auth.address, giveawayId)
      }
    }
  })

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=Join giveaway!&url=${window.location.href}`;
    window.open(url, '_blank')
  }

  const getWinners = (randomNumber) => {
    let randSeed = ethers.utils.keccak256(ethers.utils.solidityPack(['uint256'], [randomNumber]));
    const randomNumbers = [];
    for (let i = 0; i < giveaway.winnersAmount; i++) {
      randomNumbers[i] = ethers.BigNumber.from(randSeed);
      randSeed = ethers.utils.keccak256(ethers.utils.solidityPack(['bytes32'], [randSeed]));
    }

    const participants = giveaway.participants.slice();
    const winnerAddresses = [];
    for (let i = 0; i < giveaway.winnersAmount; i++) {
      const rndNumber = randomNumbers[i];
      const winnerIdx = rndNumber % participants.length;
      winnerAddresses.push(participants[winnerIdx]);
      participants.splice(winnerIdx, 1);
    }

    const itemsToGiveaway = []
    for (const card of cards) {
        for (let i = 0; i < card.amount; i++) {
          itemsToGiveaway.push({...card, amount: 1})
        }
    }
    const itemAmount = itemsToGiveaway.length / winnerAddresses.length;
    const winnerItems = []
    let offset = 0;

    while (offset != itemsToGiveaway.length) {
      winnerItems.push(itemsToGiveaway.slice(offset, offset + itemAmount))
      offset += itemAmount
    }

    const giveawayWinners = []
    for (let i = 0; i < winnerAddresses.length; i++) {
      const address = winnerAddresses[i]
      const items = winnerItems[i]
      giveawayWinners.push({address, items})
    }
    winners = giveawayWinners
  }

  $: onMount(async () => {
    giveaways.set(await fetchAccountGiveaways(address));
    if (giveawayId + 1 > $giveaways.length) {
      noGiveaway = true
    } else {
      giveaway = $giveaways[giveawayId];
      await fetchCards()
      if (giveaway.finished) {
        getWinners(giveaway.randomNumber)
      }
    }
  })

  onDestroy(() => {
    pageSubDestroy();
    authSubDestroy();
  })

  defaultContract.on('GiveawayEntered', async (_, __, _giveawayId) => {
    if (_giveawayId == giveawayId) {
      await refreshGiveaways()
      giveaway = $giveaways[giveawayId];
      if ($auth.connected && $auth.address.toLowerCase() !== address.toLowerCase()) {
        isParticipating = await isParticipatingInGiveaway($auth.address, giveawayId)
      }
    }
  })

  defaultContract.on('GiveawayCanceled', async (_, _giveawayId) => {
    if (_giveawayId == giveawayId) {
      await refreshGiveaways()
    }
  })

  defaultContract.on('GiveawayWinnersVerified', async (_, giveawayId: number) => {
    if (giveawayId == giveawayId) {
      await refreshGiveaways()
      getWinners(giveaway.randomNumber)
      loadingVRFVerification = false;
    }
  })

  defaultContract.on('RandomizingGiveawayWinner', async (_, __, _giveawayId: number) => {
    if (_giveawayId == giveawayId) {
      loadingVRFVerification = true;
    }
  })

  const isItemIsCard = (item: SkyweaverCard) => {
    return item.properties.type === 'Gold' || item.properties.type === 'Silver'
  }

  const itemClick = async (card: SkyweaverCard) => {
    if (isItemIsCard(card)) {
      const url = `https://play.skyweaver.net/items/cards/${card.properties.baseCardId}/${card.properties.type === 'Gold' ? 'gold' : 'silver'}`
      window.open(url, '_blank')
    }
  }
</script>
<div class="mx-auto max-w-[720px] flex flex-col mt-4">
  {#if loadingVRFVerification}
    <div class="w-full flex flex-col justify-center items-center">
            <span class="text-2xl">
                Waiting for Chainlink VRF Randomizer...
            </span>
      <CircularProgress style="height: 150px; width: 160px;" indeterminate />
    </div>
  {:else if noGiveaway}
    <Container>
      Giveaway with ID {giveawayId} doesn't exist yet!
    </Container>
  {:else}
    {#if giveaway && giveaway.finished}
      <Container>
        Giveaway {giveaway.randomNumber !== 0 ? 'Finished' : 'Canceled'}.
      </Container>
    {/if}
    {#if giveaway}
      <Card class="p-3 rounded-2xl w-full mt-4">
        <Content class="flex justify-between relative">
          <div>
            Giveaway ID: {giveawayId}
          </div>
        </Content>
        <hr class="mx-4 border-y-des-purple">
        <Content class="flex justify-between relative">
          <div>
            Amount of winners: {giveaway.winnersAmount}
          </div>
        </Content>
        <hr class="mx-4 border-y-des-purple">
        <Content>
          <div class="w-full">
            {#if giveaway.participants.length === 0}
              No Participants
            {:else}
              Participants: {giveaway.participants.length}
              <div class="max-h-[150px] overflow-y-auto mt-2 flex flex-col items-start">
                {#each giveaway.participants as participant}
                  <a target="_blank" href={`https://polygonscan.com/address/${participant}`}>
                    {participant.slice(0,15)}...{participant.slice(-5)}
                  </a>
                {/each}
              </div>
            {/if}
          </div>
        </Content>
        <hr class="mx-4 border-y-des-purple">
        <Content>
          <div>
            <span class="block">
                Items
            </span>
            {#if loadingCards}
              <div class="w-full flex justify-center">
                <CircularProgress style="height: 50px; width: 50px;" indeterminate />
              </div>
            {:else}
              <div class="grid mt-4 w-full max-h-[175px] overflow-y-auto grid-flow-row grid-cols-[repeat(auto-fill,_120px)] justify-center justify-items-center">
                {#each cards as card}
                  <div class:cursor-pointer={isItemIsCard(card)} on:click={() => itemClick(card)} class="text-center cursor-pointer">
                    <img style="height: 120px;" src={card.image} alt="Card">
                    <div>
                      {card.amount}x
                    </div>
                  </div>
                {/each}
              </div>
            {/if}
          </div>
        </Content>
      </Card>
    {/if}
    <div>
      <Container>
        {#if $auth.connected && giveaway && giveaway.finished && address.toLowerCase() === $auth.address.toLowerCase() && !giveaway.prizeSent}
          <Button ripple={false} class="button-shaped-round w-full py-6 mt-3" on:click={sendPrizes} variant="raised">Send Prize</Button>
        {/if}
        {#if giveaway && giveaway.prizeSent}
          Prizes have been sent to the winners!
        {/if}
        {#if giveaway && giveaway.finished}
          <Card class="p-3 rounded-2xl w-full mt-4 text-le">
            {#each winners as winner, idx}
              <Winner idx={idx} winner={winner}/>
              {#if winners.length > 1 && idx + 1 !== winners.length}
                <hr class="mx-4 border-y-des-purple">
              {/if}
            {/each}
          </Card>
        {/if}
        {#if !$auth.connected && giveaway && !giveaway.finished}
          <span>
              If you are the host of the giveaway or want to participate please connect your wallet
          </span>
        {/if}
        {#if $auth.connected && giveaway && address.toLowerCase() === $auth.address.toLowerCase() && !giveaway.finished}
          {#if !giveaway.finished}
            <div class="flex gap-2">
              <Button ripple={false} class="button-shaped-round w-full py-6 mb-4" on:click={() => navigator.clipboard.writeText(window.location.href)} variant="raised">Copy Giveaway Link</Button>
              <Button ripple={false} class="button-shaped-round w-full py-6 mb-4" on:click={shareOnTwitter} variant="raised">Share on Twitter</Button>
            </div>
          {/if}
          <Button ripple={false} class="button-shaped-round w-full py-6" on:click={finishGiveaway} variant="raised">{giveaway.participants.length < giveaway.winnersAmount ? 'Cancel' : 'Finish'} Giveaway</Button>
        {/if}
        {#if $auth.connected && giveaway && !giveaway.finished  && address.toLowerCase() !== $auth.address.toLowerCase() && !isParticipating}
          <Button ripple={false} class="button-shaped-round w-full py-6" on:click={enterGiveaway} variant="raised">Enter Giveaway</Button>
        {/if}
        {#if $auth.connected && isParticipating && giveaway && !giveaway.finished}
          You are participating in this giveaway.
        {/if}
      </Container>
    </div>
  {/if}
</div>
