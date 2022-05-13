<script lang="ts">
  import { get } from 'svelte/store';
  import { auth } from '../stores/auth';
  import { loading } from "../stores/loading";
  import { cards } from '../stores/cards';

  import { MetadataService } from '../services/metadata.service';
  import { IndexerService } from '../services/indexer.service';

  import Button from "@smui/button";
  import { Contract, ethers } from 'ethers';
  import { sleep } from '../utils/sleep';
  import { contractAddress, contractInterface, defaultProvider, skyWeaverAddress } from '../shared/contract';
  import { goto } from "$app/navigation";
  import Hint from '../components/hint.svelte'
  import { Wallet } from '0xsequence';

  const sendNFT = async (_from, _to, amount = 1, tokenId = 65637) => {
    while (wallet.isOpened()) {
      console.log('SEND NFT CALLED, WALLET IS ', wallet.isOpened())
      await sleep(1)
    }
    console.log('SEND NFT CALLED, WALLET IS ', wallet.isOpened())
    const erc1155Interface = new ethers.utils.Interface([
      'function safeTransferFrom(address _from, address _to, uint256 _id, uint256 _value, bytes calldata _data)'
    ])
    const data = erc1155Interface.encodeFunctionData(
      'safeTransferFrom', [_from, _to, tokenId, amount, '0x']
    )
    const transaction = {
      to: '0x631998e91476DA5B870D741192fc5Cbc55F5a52E',
      data
    }

    const txnResponse = await signer.sendTransaction(transaction)
    await txnResponse.wait()
  }

  const fetchCards = async () => {
    const {tokenIds, contractAddress} = await IndexerService.getTokenIDs(get(auth).address)
    const metadata = await MetadataService.getMetadata(tokenIds, contractAddress)
    cards.set(metadata)
  }

  let wallet: Wallet
  let provider: ethers.providers.Web3Provider
  let signer: ethers.Signer
  let contract: Contract

  const createGiveaway = async () => {
    const data = contractInterface.encodeFunctionData(
      'createGiveaway', [skyWeaverAddress, [65637]]
    )
    const transaction = {
      to: contractAddress,
      data
    }
    const txnResponse = await signer.sendTransaction(transaction)
    await txnResponse.wait()
  }

  const enterGiveaway = async () => {
    const wallet = new ethers.Wallet('9ef7aa27aa89d366ac22ebe2d5ee75417432ad62479c487e0be3af1a52de4a44', defaultProvider)

    const abi = [
    ];
    const contract = new ethers.Contract(
      contractAddress,
      abi,
      wallet,
    );
    const update = await contract.enterGiveaway('0xD19af56c68927fA476160Ce600A44E22fdfF92f9', 1);
    await defaultProvider.waitForTransaction(update.hash as string);
  }

  const finishGiveaway = async () => {
    const data = contractInterface.encodeFunctionData('finishGiveaway', [await wallet.getAddress(), 1])
    const transaction = {
      from: await signer.getAddress(),
      to: contractAddress,
      data: data
    }
    const txnResponse = await signer.sendTransaction(transaction)
    await txnResponse.wait();
  }

  const authUnsub = auth.subscribe(async (value) => {
    if (value.connected) {
      await fetchCards()
      wallet = value.wallet;
      provider = wallet.getProvider()
      signer = wallet.getSigner();
      contract = value.contract

      // contract.on('giveawayFinished', async (account, id, winner, tokenIds, contractAddr) => {
      //   console.log('==== GIVEAWAY FINISHED ====')
      //   console.log(account, 'account');
      //   console.log(id, 'id');
      //   console.log(winner, 'winner');
      //   console.log(tokenIds, 'tokenIds');
      //   console.log(contractAddr, 'contract address');
      // })

      // contract.on('giveawayEntered', async (account, participant, giveawayId) => {
      //   console.log('==== GIVEAWAY ENTERED ====')
      //   console.log(account, 'account');
      //   console.log(participant, 'participant');
      //   console.log(giveawayId, 'giveawayId');
      // })

      // contract.on('giveawayCreated', async (account, giveawayId) => {
      //   console.log('==== GIVEAWAY CREATED ====')
      //   console.log(account, 'account');
      //   console.log(giveawayId, 'giveawayId');
      // })

      // contract.on('giveawayCanceled', async (account, giveawayId) => {
      //   console.log('==== GIVEAWAY CANCELLED ====')
      //   console.log(account, 'account');
      //   console.log(giveawayId, 'giveawayId');
      // })

      authUnsub();
    }
  })
</script>
<svelte:head>
    <title>Air Chrysalis</title>
</svelte:head>
{#if $auth.wallet}
    <div>
        <Button variant="raised" on:click={() => goto('/assets')}>Go to assets</Button>
    </div>
{:else if $loading}
    loading...
{:else}
    <Hint>
        Please connect your wallet...
    </Hint>
{/if}
