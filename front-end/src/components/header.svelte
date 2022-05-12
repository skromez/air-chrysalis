<script lang="ts">
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import Button, { Label } from "@smui/button";
  import { sequence } from '0xsequence';
  import { onMount } from 'svelte';
  import { auth } from '../stores/auth';
  import { SequenceService } from '../services/sequence.service';
  import { ethers } from 'ethers';
  import { contractAbi, contractAddress } from '../shared/contract';
  import { loading } from '../stores/loading';
  import { goto } from "$app/navigation";
  let wallet: sequence.Wallet;

  $: onMount(() => {
    wallet = new sequence.Wallet(137);
  })

  const connect = async () => {
    loading.set(true);
    try {
      const data = await SequenceService.authenticate(wallet);
      const provider = wallet.getProvider()
      auth.set({
        address: data.address,
        connected: data.status,
        jwt: data.jwtToken,
        wallet,
        provider,
        signer: wallet.getSigner(),
        contract: new ethers.Contract(contractAddress, contractAbi, provider)
      })
    } catch (err) {
      loading.set(false);
    }
  }
</script>

<TopAppBar class="flex justify-around" variant="static" color={'secondary'}>
    <Row>
        <Section class="hover:cursor-pointer" on:click={() => goto('/assets')}>
            <Title>Air Chrysalis</Title>
        </Section>
        {#if $auth.connected}
            <Section align="end">{$auth.address.slice(0,10)}...{$auth.address.slice(-3)}</Section>
        {:else}
            <Section align="end">
                <Button on:click={connect} variant="outlined">
                    <Label>Connect Wallet</Label>
                </Button>
            </Section>
        {/if}
    </Row>
</TopAppBar>
