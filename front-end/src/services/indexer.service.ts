import axios from 'axios';
import { skyWeaverAddress } from '../shared/contract';

export class IndexerService {
	static async getTokenIDs(accountAddress: string): Promise<{ tokenId: string; amount: number }[]> {
		const res = await fetch('https://polygon-indexer.sequence.app/rpc/Indexer/GetTokenBalances', {
			method: 'POST',
			body: JSON.stringify({
				accountAddress,
				contractAddress: skyWeaverAddress
			}),
			headers: {
				'Content-Type': 'application/json'
			}
		});
		const { balances } = await res.json();
		return balances
			.filter(({ contractAddress }) => contractAddress == skyWeaverAddress)
			.map((bal) => ({ tokenId: String(bal.tokenID), amount: Number(bal.balance) / 100 }));
	}
}
