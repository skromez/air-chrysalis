import axios from 'axios';
import type { Card } from '../types/card';

export class MetadataService {
  private static readonly axiosInstance = axios.create({baseURL: 'https://metadata.sequence.app/rpc/Metadata'})

  static async getMetadata(tokenIDs: string[], contractAddress): Promise<Card[]> {
    const {data: {tokenMetadata}} = await this.axiosInstance.post('/GetTokenMetadata', {
      chainID: '4',
      contractAddress,
      tokenIDs
    })
    return tokenMetadata
  }
}
