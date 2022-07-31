import { ethers } from 'ethers';
import type { Giveaway } from '../types/giveaway';

export const contractAddress = '0x2d3f33926F70C333648c3144c8e511C4A042fF37';
export const skyWeaverAddress = '0x631998e91476da5b870d741192fc5cbc55f5a52e';
export const contractAbi = [
  'function createGiveaway(address _contractAddr, uint256[2][] memory _tokensTuple, uint32 winnersAmount)',
  'function enterGiveaway(address addr, uint256 giveawayId)',
  'function finishGiveaway(address addr, uint256 giveawayId)',
  'function getAccountGiveaways(address account) public view returns((address contractAddr, uint256[2][] tokenTuples, address[] participants, bool finished, uint256 winnersAmount, address owner, uint256 requestId, uint256 randomNumber, bool prizeSent)[] giveaways)',
  'function prizeSent(address addr, uint256 giveawayId)',
  'function isParticipatingInGiveaway(address account, uint256 _giveawayId) public view returns(bool)',

  'event GiveawayCreated(address indexed account, uint256 giveawayId)',
  'event GiveawayEntered(address indexed account, address indexed participant, uint256 giveawayId)',
  'event GiveawayCanceled(address indexed account, uint256 giveawayId)',
  'event RandomizingGiveawayWinner(uint256 indexed requestId, address indexed account, uint256 indexed giveawayId)',
  'event GiveawayWinnersVerified(uint256 randomNumber, uint256 indexed giveawayId)',
];

export const defaultProvider = new ethers.providers.AlchemyProvider(
  'matic',
  'tFAI1BGUYHZdM01NSGHGIhN_plxWAGld',
);

export const contractInterface = new ethers.utils.Interface(contractAbi);
export const defaultContract = new ethers.Contract(contractAddress, contractAbi, defaultProvider)

export const fetchAccountGiveaways = async (address: string): Promise<Giveaway[]> => {
  const data = contractInterface.encodeFunctionData('getAccountGiveaways', [address])
  const transaction = {
    to: contractAddress,
    data: data
  }
  const txnResponse = await defaultProvider.call(transaction)
  const { giveaways } = contractInterface.decodeFunctionResult('getAccountGiveaways', txnResponse)
  return giveaways.map((giveaway, index) => ({...giveaway, id: index})) as Giveaway[]
}

export const isParticipatingInGiveaway = async (address: string, giveawayId): Promise<boolean> => {
  const data = contractInterface.encodeFunctionData('isParticipatingInGiveaway', [address, giveawayId])
  const transaction = {
    to: contractAddress,
    data: data
  }
  const txnResponse = await defaultProvider.call(transaction)
  const [result] = contractInterface.decodeFunctionResult('isParticipatingInGiveaway', txnResponse)
  return result
}
