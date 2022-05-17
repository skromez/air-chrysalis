<script lang="ts">
  import { auth } from '../stores/auth';

  import { Contract, ethers } from 'ethers';
  import { goto } from "$app/navigation";
  import Container from '../components/container.svelte'
  import { Wallet } from '0xsequence';

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
{/if}
<span class="absolute bottom-2 left-2 text-xs text-des-purple">
    This app is not produced, endorsed, or supported by Horizon Blockchain Games.
</span>
