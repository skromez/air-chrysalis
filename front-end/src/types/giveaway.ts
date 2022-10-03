import type { BigNumber } from "ethers";

export interface Giveaway {
	id: number;
	contractAddr: string;
	finished: boolean;
	participants: string[];
	tokenTuples: Array<[BigNumber, BigNumber]>;
	requestId: BigNumber;
	randomNumber: BigNumber;
	winnersAmount: number;
	owner: string;
	prizeSent: boolean;
}
