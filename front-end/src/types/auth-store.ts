import type { Wallet } from '0xsequence';
import type { Web3Signer } from '0xsequence/dist/declarations/src/provider';
import type { ethers } from 'ethers';

export interface AuthStore {
  address: string;
  connected: boolean;
  jwt: string;
  wallet?: Wallet;
  provider?: ethers.providers.Web3Provider;
  signer?: Web3Signer;
  contract?: ethers.Contract;
}
