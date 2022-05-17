import axios from 'axios';
import { skyWeaverAddress } from '../shared/contract';

export class IndexerService {
  private static readonly axiosInstance = axios.create({baseURL: 'https://polygon-indexer.sequence.app/rpc/Indexer'})

  static async getTokenIDs(accountAddress: string): Promise<{tokenId: string, amount: number}[]> {
    const {data: {balances}} = await this.axiosInstance.post('/GetTokenBalances', {
      accountAddress,
      contractAddress: skyWeaverAddress
    })
    return balances
      .filter(({contractAddress}) => contractAddress == skyWeaverAddress)
      .map((bal) => ({tokenId: String(bal.tokenID), amount: Number(bal.balance) / 100}))
  }
}
