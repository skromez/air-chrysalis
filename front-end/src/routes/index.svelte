<script lang="ts">
  import { auth } from '../stores/auth';

  import { Contract, ethers } from 'ethers';
  import { goto } from "$app/navigation";
  import Container from '../components/container.svelte'
  import { Wallet } from '0xsequence';
  import { contractAddress } from "../shared/contract.ts";

  let wallet: Wallet
  let provider: ethers.providers.Web3Provider
  let signer: ethers.Signer
  let contract: Contract

  const authUnsub = auth.subscribe(async (value) => {
    if (value.connected) {
      wallet = value.wallet;
      provider = wallet.getProvider()
      signer = wallet.getSigner();
      contract = value.contract;
      await goto('/assets');

      authUnsub();
    }
  })
</script>
{#if !$auth.connected}
    <Container>
        Please connect your wallet...
    </Container>
    <div class="mt-8 text-2xl text-center mx-36">
        Air Chrysalis is an open-source, unofficial giveaway tool for Skyweaver cards.
        <br>
        <br>
        The whole giveaway process can be seen <a target="_blank" href={`https://polygonscan.com/address/${contractAddress}`}>on-chain</a> and the randomization is verified by <a href="https://docs.chain.link/docs/chainlink-vrf/"> Chainlink VRF</a>.
    </div>
{/if}
