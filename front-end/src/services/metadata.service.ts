import axios from 'axios';
import type { Card } from '../types/card';
import { skyWeaverAddress } from '../shared/contract';
import type { CardOwnership } from '../types/card-ownership';

export class MetadataService {
  private static readonly axiosInstance = axios.create({baseURL: 'https://metadata.sequence.app/rpc/Metadata'})

  static async getMetadata(tokenIDs: string[]): Promise<Card[]> {
    const {data: {tokenMetadata}} = await this.axiosInstance.post('/GetTokenMetadata', {
      chainID: '4',
      contractAddress: skyWeaverAddress,
      tokenIDs
    })
    return tokenMetadata
  }

  static async getCardOwnership(accountAddress: string): Promise<CardOwnership[]> {
    const result = await axios.post('https://api.skyweaver.net/rpc/SkyWeaverAPI/GetCardOwnership', {
      accountAddress,
      contractQuery: false,
    })
    return result.data.res.cardBalances
  }
}
