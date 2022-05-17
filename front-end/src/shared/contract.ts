import { BigNumber, ethers } from 'ethers';
import type { Giveaway } from '../types/giveaway';

export const contractAddress = '0xC3b2eBCB928154960432EF0f57972fdc408924BD';
export const skyWeaverAddress = '0x631998e91476da5b870d741192fc5cbc55f5a52e';
export const contractAbi = [
  'function createGiveaway(address _contractAddr, uint256[2][] memory _tokensTuple)',
  'function enterGiveaway(address account, uint256 _giveawayId)',
  'function finishGiveaway(address account, uint256 _giveawayId)',
  'function getAccountGiveaway(address account, uint256 _giveawayId) public view returns((address contractAddr, uint256[2][] tokenTuples, address[] participants, bool finished, address winner, bool prizeSent) giveaway)',
  'function getAccountGiveaways(address account) public view returns(uint256[] giveaways)',
  'function prizeSent(address account, uint256 _giveawayId)',
  'function isParticipatingInGiveaway(address account, uint256 _giveawayId) public view returns(bool)',

  'event giveawayFinished(address indexed account, uint256 giveawayId, address indexed winner, uint256[] tokenIds, address contractAddr)',
  'event giveawayCreated(address indexed account, uint256 giveawayId)',
  'event giveawayEntered(address indexed account, address indexed participant, uint256 giveawayId)',
  'event giveawayCanceled(address indexed account, uint256 giveawayId)',
  'event giveawayWinnerVerified(uint256 indexed requestId, address indexed winnerAddress, uint256 indexed giveawayId);'
];

export const defaultProvider = new ethers.providers.AlchemyProvider(
  'matic',
  'tFAI1BGUYHZdM01NSGHGIhN_plxWAGld',
);

export const contractInterface = new ethers.utils.Interface(contractAbi);
export const defaultContract = new ethers.Contract(contractAddress, contractAbi, defaultProvider)

export const fetchGiveawayDetails = async (address: string, giveawayId: number): Promise<Giveaway> => {
  const data = contractInterface.encodeFunctionData('getAccountGiveaway', [address, giveawayId])
  const transaction = {
    to: contractAddress,
    data: data
  }
  const txnResponse = await defaultProvider.call(transaction)
  const decoded = contractInterface.decodeFunctionResult('getAccountGiveaway', txnResponse)
  return {
    giveawayId,
    participants: decoded.giveaway.participants,
    contractAddr: decoded.giveaway.contractAddr,
    finished: decoded.giveaway.finished,
    tokenTuples: decoded.giveaway.tokenTuples,
    winner: decoded.giveaway.winner,
    prizeSent: decoded.giveaway.prizeSent,
  }
}

export const fetchAccountGiveawayIds = async (address: string): Promise<number[]> => {
  const data = contractInterface.encodeFunctionData('getAccountGiveaways', [address])
  const transaction = {
    to: contractAddress,
    data: data
  }
  const txnResponse = await defaultProvider.call(transaction)
  const decoded = contractInterface.decodeFunctionResult('getAccountGiveaways', txnResponse)
  return decoded.giveaways.map((id: BigNumber) => id.toNumber())
}
