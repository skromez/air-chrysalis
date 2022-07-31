<script lang="ts">
  import Card, { Content } from "@smui/card";
  import type { Giveaway } from '../types/giveaway';
  import Button from "@smui/button";
  import { goto } from "$app/navigation";

  export let giveaway: Giveaway;
  export let address: string;
</script>
<Card class="m-4 rounded-2xl">
    <Content>ID: {giveaway.id}</Content>
    <hr class="mx-4 border-y-des-purple">
    <Content>Participants: {giveaway.participants.length}</Content>
    <hr class="mx-4 border-y-des-purple">
    <Content>Finished: {giveaway.finished ? 'Yes' : 'No'}</Content>
    <hr class="mx-4 border-y-des-purple">
    <Button ripple={false} on:click={() => goto(`/${address}/${giveaway.id}`)} class="button-shaped-round m-4" variant="raised">Go to giveaway</Button>
</Card>
