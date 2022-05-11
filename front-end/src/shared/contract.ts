import { ethers } from 'ethers';

export const contractAddress = '0xBae24D4152C1F219e36102f362bD682c8DB816c8';
export const skyWeaverAddress = '0x631998e91476da5b870d741192fc5cbc55f5a52e';
export const contractAbi = [
  'function createGiveaway(address _contractAddr, uint256[] memory _tokenIds)',
  'function enterGiveaway(address account, uint256 _giveawayId)',
  'function finishGiveaway(address account, uint256 _giveawayId)',
  'function resetGiveaways()',
  'function getAccountGiveaway(address account, uint256 _giveawayId) public view returns((address contractAddr, uint256[] tokenIds, address[] participants, bool finished) giveaway)',
  'function getAccountGiveaways(address account) public view returns(uint256[])',

  'event giveawayFinished(address indexed account, uint256 giveawayId, address indexed winner, uint256[] tokenIds, address contractAddr)',
  'event giveawayCreated(address indexed account, uint256 giveawayId)',
  'event giveawayEntered(address indexed account, address indexed participant, uint256 giveawayId)',
  'event giveawayCanceled(address indexed account, uint256 giveawayId)'
];

export const defaultProvider = new ethers.providers.AlchemyProvider(
  'matic',
  'tFAI1BGUYHZdM01NSGHGIhN_plxWAGld',
);

export const contractInterface = new ethers.utils.Interface(contractAbi);
