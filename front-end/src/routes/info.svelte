<script lang="ts">
  import { contractAddress } from "../shared/contract.ts";
</script>
<div class="mt-8 text-2xl text-center mx-36">
  Air Chrysalis is an <a target="_blank" href="https://github.com/skromez/air-chrysalis"> open-source</a>, unofficial giveaway tool for Skyweaver cards.
  <br>
  <br>
  If you notice any bugs, or want to suggest any improvement to existing application, please create an
  <a target="_blank" href="https://github.com/skromez/air-chrysalis/issues">issue</a>
  and give a short description of issue/request.
  <br>
  <br>
  The whole giveaway process can be seen <a target="_blank" href={`https://polygonscan.com/address/${contractAddress}`}>on-chain</a> and the randomization is verified by <a href="https://docs.chain.link/docs/chainlink-vrf/"> Chainlink VRF</a>.
</div>
