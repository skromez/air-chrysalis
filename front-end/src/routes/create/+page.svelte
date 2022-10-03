<script lang="ts">
import { cards } from "../../stores/cards";
import { Signer } from "ethers";
import { auth } from "../../stores/auth";
import {
	contractAddress,
	contractInterface,
	defaultContract,
	skyWeaverAddress
} from "../../shared/contract";
import { goto } from "$app/navigation";
import CreateCard from "../../components/create-card.svelte";
import Button from "@smui/button";
import { onMount } from "svelte";
import Container from "../../components/container.svelte";
import CircularProgress from "@smui/circular-progress";
import { Content } from "@smui/card";
import Tooltip, { Wrapper } from "@smui/tooltip";
import { Icon } from "@smui/common";

let loading = false;
let winnersAmount = 1;
let notEvenlySplit = false;

let maxWinnersAmount = $cards
	.filter((card) => card.selected)
	.reduce((prev, curr) => {
		return prev + curr.selectedAmount;
	}, 0);

const calcMaxWinnersAmount = () => {
	maxWinnersAmount = $cards
		.filter((card) => card.selected)
		.reduce((prev, curr) => {
			return prev + curr.selectedAmount;
		}, 0);
};

const setWinnersAmountMax = () => {
	winnersAmount = maxWinnersAmount;
};

const createGiveaway = async () => {
	const signer: Signer = $auth.signer;
	const selectedCards = $cards
		.filter((card) => card.selected)
		.map((card) => [card.tokenId, card.selectedAmount]);
	const data = contractInterface.encodeFunctionData("createGiveaway", [
		skyWeaverAddress,
		selectedCards,
		winnersAmount
	]);
	const transaction = {
		to: contractAddress,
		data
	};
	loading = true;
	try {
		const txnResponse = await signer.sendTransaction(transaction);
		await txnResponse.wait();
	} catch (err) {
		loading = false;
	}
};

$: onMount(async () => {
	if ($cards.filter((card) => card.selected).length === 0) {
		await goto("/assets");
	}
});

$: if (winnersAmount) {
	notEvenlySplit = maxWinnersAmount % winnersAmount !== 0;
}

const onRemoveCard = async (event) => {
	const tokenId = event.detail;
	cards.update((prev) =>
		prev.map((card) => (card.tokenId === tokenId ? { ...card, selected: false } : card))
	);
	calcMaxWinnersAmount();
	if ($cards.every((card) => !card.selected)) {
		await goto("/assets");
	}
};

defaultContract.on("GiveawayCreated", async (account, giveawayId) => {
	if (account.toLowerCase() === $auth.address.toLowerCase()) {
		cards.update((cards) => cards.map((card) => ({ ...card, selected: false, selectedAmount: 1 })));
		await goto(`${account}/${giveawayId}`);
	}
});
</script>

{#if !loading}
	<div class="mx-auto max-w-[720px] flex flex-col items-center">
		{#each $cards.filter((card) => card.selected) as card (card.tokenId)}
			<CreateCard
				on:changeAmount="{calcMaxWinnersAmount}"
				on:removeCard="{onRemoveCard}"
				card="{card}"
			/>
		{/each}
		{#if $cards.filter((card) => card.selected).length}
			<Button
				disabled="{$cards.every((card) => card.selected)}"
				on:click="{async () => await goto('/assets')}"
				ripple="{false}"
				class="button-shaped-round w-full py-6 normal-case text-base"
				variant="raised">Add more cards</Button
			>
			<div class="m-4 rounded-2xl w-full">
				<Content
					class="rounded-2xl border-des-purple border-solid border flex justify-between items-center"
				>
					<span> Winners Amount: </span>
					<div class="flex justify-center items-center">
						{#if notEvenlySplit}
							<Wrapper>
								<Icon class="material-icons text-bright-purple cursor-help max-w-[35px]"
									>info_outlined</Icon
								>
								<Tooltip yPos="below" xPos="start"
									>Amount of items should be evenly split between amount of winners. e.g. 4 items
									can't be split between 3 winners evenly.</Tooltip
								>
							</Wrapper>
						{/if}
						<Button
							disabled="{winnersAmount === 1}"
							ripple="{false}"
							on:click="{() => winnersAmount--}"
							variant="raised"
							class="button-shaped-round min-w-[12px] w-[24px] h-[25px]">-</Button
						>
						<div class="mx-4 text-2xl flex items-center gap-1">
							<span>{winnersAmount}</span>
							<span class="text-xl text-gray-500"> / {maxWinnersAmount} </span>
						</div>
						<Button
							disabled="{winnersAmount === maxWinnersAmount}"
							ripple="{false}"
							on:click="{() => winnersAmount++}"
							variant="raised"
							class="button-shaped-round min-w-[12px] w-[24px] h-[25px]">+</Button
						>
						<Button
							disabled="{winnersAmount === maxWinnersAmount}"
							ripple="{false}"
							on:click="{setWinnersAmountMax}"
							variant="raised"
							class="text-xs button-shaped-round min-w-[42px] w-[42px] h-[25px] normal-case ml-2"
							>Max</Button
						>
					</div>
				</Content>
			</div>
			<Wrapper>
				<div class="w-full">
					<Button
						disabled="{notEvenlySplit}"
						on:click="{createGiveaway}"
						ripple="{false}"
						class="button-shaped-round w-full py-6 normal-case text-base"
						variant="raised">Continue</Button
					>
				</div>
			</Wrapper>
		{/if}
	</div>
{:else}
	<Container>
		<div class="block mb-4">Creating Giveaway...</div>
		<CircularProgress style="height: 120px; width: 120px;" indeterminate />
	</Container>
{/if}
