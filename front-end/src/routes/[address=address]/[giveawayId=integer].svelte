<script lang="ts">
  import { page } from '$app/stores';
  import { onDestroy, onMount } from 'svelte';
  import {
    contractAddress,
    contractInterface,
    defaultContract,
    fetchGiveawayDetails, isParticipatingInGiveaway,
    skyWeaverAddress
  } from '../../shared/contract';
  import type { Giveaway } from '../../types/giveaway';
  import type { Card as SkyweaverCard } from "../../types/card";
  import Container from '../../components/container.svelte';
  import Button from "@smui/button";
  import { auth } from '../../stores/auth';
  import Card, { Content } from "@smui/card";
  import { MetadataService } from '../../services/metadata.service';
  import CircularProgress from "@smui/circular-progress";
  import { ethers } from 'ethers';

  let address: string;
  let items: SkyweaverCard[] = [];
  let loadingCards = true;
  let loadingVRFVerification = false;
  let giveawayId: number;
  let giveaway: Giveaway
  let isParticipating = false;
  let isWinner = false;

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

  const sendNFT = async () => {
    const erc1155Interface = new ethers.utils.Interface([
      'function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data)'
    ])

    const transactions = giveaway.tokenTuples.map((tokenTuple) => {
      const [tokenId, tokenAmount] = tokenTuple;
      const data = erc1155Interface.encodeFunctionData(
        'safeTransferFrom', [$auth.address, giveaway.winner, tokenId, tokenAmount * 100, '0x']
      )
      return {
        to: skyWeaverAddress,
        data
      }
    })

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
      giveaway = await fetchGiveawayDetails(address, giveawayId)
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
    const tokensAmountMap = new Map(giveaway.tokenTuples.map((tuple) => [tuple[0].toString(), tuple[1].toNumber()]))
    const tokenIds = giveaway.tokenTuples.map((tuple) => tuple[0].toString())
    if (giveaway.tokenTuples.length > 50) {
      items = [];
      let tokensLeft = giveaway.tokenTuples.length;
      let offset = 0
      let chunkSize = 50;
      while (tokensLeft > 0) {
        let slice = giveaway.tokenTuples.map((tuple) => tuple[0].toString()).slice(offset, chunkSize);
        const metadata = await MetadataService.getMetadata(slice)
        items.concat(metadata.map((card) => {
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
      items = metadata.map((card) => {
        return {
          ...card,
          amount: tokensAmountMap.get(card.tokenId)
        }
      })
    }
    loadingCards = false;
  }

  const authSubDestroy = auth.subscribe(async (value) => {
    if (value.connected) {
      if (address.toLowerCase() !== $auth.address.toLowerCase()) {
        isParticipating = await isParticipatingInGiveaway($auth.address, giveawayId)
      }
    }
  })

  $: onMount(async () => {
    giveaway = await fetchGiveawayDetails(address, giveawayId)
    isWinner = $auth.connected && $auth.address.toLowerCase() == giveaway.winner.toLowerCase()
    await fetchCards()
  })

  onDestroy(() => {
    pageSubDestroy();
    authSubDestroy();
  })

  defaultContract.on('GiveawayEntered', async (_, __, _giveawayId) => {
    if (_giveawayId == giveawayId) {
      giveaway = await fetchGiveawayDetails(address, giveawayId)
      if ($auth.connected && $auth.address.toLowerCase() !== address.toLowerCase()) {
        isParticipating = await isParticipatingInGiveaway($auth.address, giveawayId)
      }
    }
  })

  defaultContract.on('GiveawayCanceled', async (_, _giveawayId) => {
    if (_giveawayId == giveawayId) {
      giveaway = await fetchGiveawayDetails(address, giveawayId)
    }
  })

  defaultContract.on('GiveawayWinnerVerified', async (_, _giveawayId: number) => {
    if (_giveawayId == giveawayId) {
      giveaway = await fetchGiveawayDetails(address, giveawayId)
      loadingVRFVerification = false;
      isWinner = $auth.connected && giveaway.winner.toLowerCase() === $auth.address.toLowerCase()
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
    {:else}
        {#if giveaway && giveaway.finished && !isWinner}
            <Container>
                Giveaway {giveaway.winner !== ethers.constants.AddressZero ? 'Finished' : 'Canceled'}.
            </Container>
        {:else if giveaway && giveaway.finished && isWinner}
            <Container>
                YOU WON THE GIVEAWAY!!! 🎉🎉🎉
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
                <Content>
                    <div class="w-full">
                        {#if giveaway.participants.length === 0}
                            No Participants
                        {:else}
                            Participants: {giveaway.participants.length}
                            <div class="max-h-[150px] overflow-y-auto mt-4 flex flex-col">
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
                                {#each items as card}
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
                {#if giveaway && giveaway.finished && giveaway.winner !== ethers.constants.AddressZero}
                    <div class="mb-3">
                        Winner: <a target="_blank" href={`https://polygonscan.com/address/${giveaway.winner}`}>{giveaway.winner}</a>
                    </div>
                {/if}
                {#if !$auth.connected && giveaway}
                    <span>
                        If you are the host of the giveaway or want to participate please connect your wallet
                    </span>
                {/if}
                {#if $auth.connected && giveaway && address.toLowerCase() === $auth.address.toLowerCase() && !giveaway.finished}
                    {#if giveaway.participants.length === 0}
                        <Button ripple={false} class="button-shaped-round w-full py-6 mb-4" on:click={() => navigator.clipboard.writeText(window.location.href)} variant="raised">Copy Giveaway Link</Button>
                    {/if}
                    <Button ripple={false} class="button-shaped-round w-full py-6" on:click={finishGiveaway} variant="raised">Finish Giveaway</Button>
                {/if}
                {#if $auth.connected && giveaway && !giveaway.finished  && address.toLowerCase() !== $auth.address.toLowerCase() && !isParticipating}
                    <Button ripple={false} class="button-shaped-round w-full py-6" on:click={enterGiveaway} variant="raised">Enter Giveaway</Button>
                {/if}
                {#if $auth.connected && isParticipating && giveaway && !giveaway.finished}
                    You are participating in this giveaway.
                {/if}
                {#if $auth.connected && giveaway && giveaway.finished && address.toLowerCase() === $auth.address.toLowerCase() && !giveaway.prizeSent && giveaway.winner !== ethers.constants.AddressZero}
                    <Button ripple={false} class="button-shaped-round w-full py-6 mt-3" on:click={sendNFT} variant="raised">Send Prize</Button>
                {/if}
                {#if giveaway && giveaway.prizeSent}
                    Prize has been sent to the winner!
                {/if}
            </Container>
        </div>
    {/if}
</div>
