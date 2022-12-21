<script lang='ts'>
	import Header from '../components/header.svelte';
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { sequence } from '0xsequence';
	import { auth } from '../stores/auth';
	import heart from '../images/heart.png';
	import { ethers } from 'ethers';
	import '../app.css';

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
