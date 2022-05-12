export interface Giveaway {
  giveawayId?: number;
  contractAddr: string
  finished: boolean
  participants: string[]
  tokenIds: number[]
}
