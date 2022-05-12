<script lang="ts">
  import Card, { Content } from "@smui/card";
  import type { Giveaway } from '../types/giveaway';
  import Button from "@smui/button";
  import { goto } from "$app/navigation";

  export let giveaway: Giveaway;
  export let address: string;
</script>
<Card class="m-4 rounded-2xl">
    <Content>ID: {giveaway.giveawayId}</Content>
    <Content>Participants: {giveaway.participants.length}</Content>
    <Content>Finished: {giveaway.finished ? 'Yes' : 'No'}</Content>
    <Button on:click={() => goto(`/${address}/${giveaway.giveawayId}`)} ripple={false} class="button-shaped-round m-4" variant="raised">Go to giveaway</Button>
</Card>
