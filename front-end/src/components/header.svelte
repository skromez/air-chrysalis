<script lang="ts">
  import TopAppBar, { Row, Section, Title } from "@smui/top-app-bar";
  import Button from "@smui/button";
  import { sequence } from '0xsequence';
  import { auth } from '../stores/auth';
  import { SequenceService } from '../services/sequence.service';
  import { ethers } from 'ethers';
  import { contractAbi, contractAddress } from '../shared/contract';
  import { goto } from "$app/navigation";
  import logo from '../images/logo.png'
  import { browser } from "$app/environment";
  import IconButton from '@smui/icon-button';

  const connect = async () => {
    const wallet = new sequence.Wallet(137)
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
  }

  const logout = () => {
    auth.set({
      address: '',
      connected: false,
      jwt: '',
    })
    localStorage.removeItem('jwt')
    localStorage.removeItem('expiresAt')
  }
</script>

<TopAppBar class="flex justify-around" variant="static" color={'secondary'}>
    <Row>
        <Section class="hover:cursor-pointer" on:click={() => goto('/assets')}>
            <Title class="text-2xl flex">
                <img style="width: 32px; height: 32px;" class="mr-2" src={logo} alt="Air Chrysalis">
                Air Chrysalis
            </Title>
        </Section>
        {#if $auth.connected}
            <Section class="text-xl pr-[20px]" align="end">
                <span class="mr-2">
                    {$auth.address.slice(0,10)}...{$auth.address.slice(-3)}
                </span>
                <IconButton on:click={logout} ripple={false} class="material-icons">logout</IconButton>
            </Section>
        {:else if browser}
            <Section align="end" class="mr-2">
                <Button ripple={false} on:click={connect} class="button-shaped-round normal-case" variant="outlined">
                    Connect Wallet
                </Button>
            </Section>
        {/if}
    </Row>
</TopAppBar>
