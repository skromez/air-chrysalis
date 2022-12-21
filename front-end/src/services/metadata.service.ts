import type { Card } from "../types/card";
import { skyWeaverAddress } from "../shared/contract";

export class MetadataService {
	static async getMetadata(tokenIDs: string[]): Promise<Card[]> {
		if (tokenIDs.length) {
			const res = await fetch("https://metadata.sequence.app/rpc/Metadata/GetTokenMetadata", {
				method: "POST",
				body: JSON.stringify({
					chainID: "137",
					contractAddress: skyWeaverAddress,
					tokenIDs
				}),
				headers: {
					"Content-Type": "application/json"
				}
			});
			const { tokenMetadata } = await res.json();
			return tokenMetadata;
		} else {
			return [];
		}
	}
}
