import axios from 'axios';

export class IndexerService {
  // private static readonly axiosInstance = axios.create({baseURL: 'https://polygon-indexer.sequence.app/rpc/Indexer'})
  private static readonly axiosInstance = axios.create({baseURL: 'https://rinkeby-indexer.sequence.app/rpc/Indexer'})

  static async getTokenIDs(accountAddress: string): Promise<{tokenIds: string[], contractAddress: string}> {
    const {data: {balances: contractBalances}} = await this.axiosInstance.post('/GetTokenBalances', {
      accountAddress,
    })
    const {data: {balances}} = await this.axiosInstance.post('/GetTokenBalances', {
      accountAddress,
      contractAddress: contractBalances[0].contractAddress
      // contractAddress: '0x631998e91476da5b870d741192fc5cbc55f5a52e'
      // contractAddress: '0xd045df0b4d618eb228087a40049338d3747e5542'
    })
    return {tokenIds: balances.map((bal) => bal.tokenID), contractAddress: contractBalances[0].contractAddress }
  }
}
