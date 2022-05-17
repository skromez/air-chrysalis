import type { BigNumber } from 'ethers';

export interface Giveaway {
  giveawayId?: number;
  contractAddr: string
  finished: boolean
  participants: string[]
  tokenTuples: Array<[BigNumber, BigNumber]>;
  winner: string;
  prizeSent: boolean;
}
