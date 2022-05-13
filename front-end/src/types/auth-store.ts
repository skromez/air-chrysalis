import type { Wallet } from '0xsequence';
import type { ethers } from 'ethers';
import type { Signer } from 'ethers';

export interface AuthStore {
  address: string;
  connected: boolean;
  jwt: string;
  wallet?: Wallet;
  provider?: ethers.providers.Web3Provider;
  signer?: Signer;
  contract?: ethers.Contract;
}
