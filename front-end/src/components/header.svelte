<script lang="ts">
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import Button, { Label } from "@smui/button";
  import { sequence } from '0xsequence';
  import { onMount } from 'svelte';
  import auth from '../stores/auth';
  import { SequenceService } from '../services/sequence.service';
  let wallet: sequence.Wallet;

  $: onMount(() => {
    wallet = new sequence.Wallet('rinkeby');
  })

  const connect = async () => {
    const data = await SequenceService.authenticate(wallet);
    auth.set({address: data.address, connected: data.status, jwt: data.jwtToken})
  }
</script>

<TopAppBar class="flex justify-around" variant="static" color={'secondary'}>
    <Row class="">
        <Section>
            <Title>Air Crhysalis</Title>
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
