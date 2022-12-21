<script lang='ts'>
	import Header from '../components/header.svelte';
	import Dialog, { Actions, Content, Title } from '@smui/dialog';
	import Button, { Label } from '@smui/button';
	import IconButton from '@smui/icon-button';
	import Slider from '@smui/slider';
	import FormField from '@smui/form-field';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { sequence } from '0xsequence';
	import { auth } from '../stores/auth';
	import heart from '../images/heart.png';
	import '../app.css';
	import { ethers } from 'ethers';

	let open = false;
	let donationAmount = 0.5;
	const donationAddress = '0x5E007Ad2027114331fD9C829008c8a591057B85a';
	const donate = async () => {
		const transaction = {
			from: await $auth.signer.getAddress(),
			to: donationAddress,
			value: ethers.utils.parseEther(String(donationAmount))
		};
		const txnResponse = await $auth.signer.sendTransaction(transaction);
		await txnResponse.wait();
	};
	$: onMount(async () => {
		const jwt = localStorage.getItem('jwt');
		const wallet = new sequence.Wallet(137);
		const expiresAt = Number(localStorage.getItem('expiresAt'));
		const now = Math.floor(Date.now() / 1000);
		if (jwt && expiresAt > now) {
			await wallet.connect({ authorize: false, app: 'Air Chrysalis' });
			const provider = wallet.getProvider();
			auth.set({
				address: await wallet.getAddress(),
				connected: true,
				jwt,
				wallet,
				provider,
				signer: wallet.getSigner()
			});
		} else {
			localStorage.removeItem('jwt');
			localStorage.removeItem('expiresAt');
		}
	});
	const copyAddress = () => {
		navigator.clipboard.writeText(donationAddress);
	};
</script>

<svelte:head>
	<title>Air Chrysalis</title>
</svelte:head>
<Header />
<div class='px-4 pb-12 pt-2'>
	{#if browser}
		<slot />
		<Dialog
			class='z-50'
			bind:open
		>
			<Title>Choose amount in MATIC</Title>
			<Content>
				<div>
					<FormField style='display: flex; flex-direction: column-reverse;'>
						<Slider
							step={0.5}
							max={10}
							min={0.5}
							bind:value={donationAmount}
							style='width: 100%;'
						/>
						<span>{donationAmount}</span>
					</FormField>
				</div>
				<div class='flex flex-col items-center'>
					<span>
						Or you can donate manually using this address
					</span>
					<div class='flex items-center'>
						<a href=''>{donationAddress}</a>
						<IconButton on:click={copyAddress} ripple='{false}' class='material-icons'>content_copy</IconButton>
					</div>
				</div>
			</Content>
			<Actions>
				<Button on:click={() => (open = false)}>
					<Label>Cancel</Label>
				</Button>
				<Button on:click={donate}>
					<Label>Donate</Label>
				</Button>
			</Actions>
		</Dialog>
	{/if}
</div>
<div>
	<div class='absolute bottom-6 left-2 text-xs text-des-purple'>
		Please consider <a href='' on:click={() => (open = true)}>donating</a> if you like the dApp!
	</div>
	<span class='absolute bottom-2 left-2 text-xs text-des-purple'>
	This app is not produced or supported by Horizon Blockchain Games.
</span>
</div>
<span class='absolute bottom-2 right-2 text-xs text-des-purple'>
	Made by <a target='_blank' href='https://twitter.com/fuliggined'>Fuliggine</a> and
	<a target='_blank' href='https://github.com/skromez'>skr</a>
	with
	<a target='_blank' href='https://metaguild.com/'>
		<img style='width: 20px; height: 20px; display: inline' src='{heart}' alt='heart emoji' />
	</a>
</span>