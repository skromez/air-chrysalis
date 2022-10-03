export interface CardOwnership {
	[key: number]: {
		SW_BASE_CARDS: { balance: string };
		SW_GOLD_CARDS: { balance: string };
		SW_SILVER_CARDS: { balance: string };
	};
}
