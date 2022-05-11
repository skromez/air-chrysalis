import type { sequence } from '0xsequence';
import type { ethers } from 'ethers';
import type { Web3Signer } from '0xsequence';

export interface AuthStore {
  address: string;
  connected: boolean;
  jwt: string;
  wallet?: sequence.Wallet;
  provider?: ethers.providers.Web3Provider;
  signer?: Web3Signer;
  contract?: ethers.Contract;
}
