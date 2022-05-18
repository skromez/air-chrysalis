# Air Chrysalis
an open-source, unofficial giveaway tool for [Skyweaver](skyweaver.net) cards. The whole giveaway process can be seen on-chain and the randomization is verified by
[Chainlink VRF](https://docs.chain.link/docs/chainlink-vrf/).

### Contents
- hardhat folder
- front-end folder

### Hardhat folder
Contains the AirChrysalis.sol 
[contract](https://polygonscan.com/address/0xC120Fa1211B791fD37d7da14748e98Df09c829CB#code)
which is being used for the giveaways.
<br>
To run tests locally:
  - yarn
  - yarn test
  - yarn coverage (to check coverage of the tests)

### Front-end folder
Front-end application written on svelte.js
<br>
To run the front-end locally (no .env needed):
  - yarn/npm install
  - npm run dev

it will start the local server on **https**://localhost:3000 (https is needed to send request to sequences APIs to avoid CORS errors)
