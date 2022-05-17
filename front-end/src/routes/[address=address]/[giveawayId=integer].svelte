<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import {
    contractAddress,
    contractInterface,
    defaultContract,
    fetchGiveawayDetails,
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

  const finishGiveaway = async () => {
    const data = contractInterface.encodeFunctionData('finishGiveaway', [address, giveawayId])
    const transaction = {
      from: await $auth.signer.getAddress(),
      to: contractAddress,
      data: data
    }
    const txnResponse = await $auth.signer.sendTransaction(transaction)
    await txnResponse.wait();
    loadingVRFVerification = true;
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
      const result = await txnResponse.wait()
      console.log(result)
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

  page.subscribe(({params}) => {
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

  $: onMount(async () => {
    giveaway = await fetchGiveawayDetails(address, giveawayId)
    await fetchCards()
  })

  defaultContract.on('giveawayEntered', async (_, __, _giveawayId) => {
    if (_giveawayId == giveawayId) {
      giveaway = await fetchGiveawayDetails(address, giveawayId)
    }
  })

  defaultContract.on('giveawayWinnerVerified', async (_, __, _giveawayId: number) => {
    if (_giveawayId == giveawayId) {
      giveaway = await fetchGiveawayDetails(address, giveawayId)
      loadingVRFVerification = false;
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
        {#if giveaway && giveaway.finished}
            <Container>
                Giveaway Finished.
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
                            Participants
                            <ul class="max-h-[150px] overflow-y-auto mt-4">
                                {#each giveaway.participants as participant}
                                    <li>
                                        <a href={`https://polygonscan.com/address/${participant}`}>
                                            {participant.slice(0,10)}...{participant.slice(-5)}
                                        </a>
                                    </li>
                                {/each}
                            </ul>
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
                {#if giveaway && giveaway.finished}
                    <div class="mb-3">
                        Winner: <a href={`https://polygonscan.com/address/${giveaway.winner}`}>{giveaway.winner}</a>
                    </div>
                {/if}
                {#if !$auth.connected && giveaway}
                <span>
                    If you are the host of the giveaway or want to participate please connect your wallet
                </span>
                {:else if address.toLowerCase() === $auth.address.toLowerCase() && giveaway && !giveaway.finished}
                    <Button ripple={false} class="button-shaped-round w-full py-6" on:click={finishGiveaway} variant="raised">Finish Giveaway</Button>
                {:else if giveaway && !giveaway.finished}
                    <Button ripple={false} class="button-shaped-round w-full py-6" on:click={enterGiveaway} variant="raised">Enter Giveaway</Button>
                {/if}
                {#if giveaway && giveaway.finished && address.toLowerCase() === $auth.address.toLowerCase() && !giveaway.prizeSent}
                    <Button ripple={false} class="button-shaped-round w-full py-6 mt-3" on:click={sendNFT} variant="raised">Send Prize</Button>
                {/if}
            </Container>
        </div>
    {/if}
</div>
