<script lang="ts">
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import Button, { Label } from "@smui/button";
  import { ConnectDetails } from '../types/connect-details';
  import axios from 'axios';
  import { sequence } from '0xsequence';
  import { onMount } from 'svelte';
  import auth from '../stores/auth';
  import type { AuthToken } from '../types/auth-token';
  import { api } from '../shared/api';

  let wallet: sequence.Wallet

  $: onMount(async () => {
    wallet = new sequence.Wallet('polygon')
  })

  const connect = async () => {
    const connectDetails: ConnectDetails = await wallet.connect({
      app: 'Air Crhysalis',
      authorize: true
    })
    const { data } : {data: AuthToken} = await axios.post(`${api.sequence}/GetAuthToken`, {
      ewtString: connectDetails.proof.proofString,
      testnetMode: false
    })
    auth.set({address: data.address, connected: data.status, jwt: data.jwtToken})
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.jwtToken}`;
  }
</script>

<TopAppBar class="flex justify-around" variant="static" color={'secondary'}>
    <Row class="">
        <Section>
            <Title>Air Crhysalis</Title>
        </Section>
        {#if $auth.connected}
            <Section align="end">Connected</Section>
        {:else}
            <Section align="end">
                <Button on:click={connect} variant="outlined">
                    <Label>Connect Wallet</Label>
                </Button>
            </Section>
        {/if}
    </Row>
</TopAppBar>
