export interface Card {
  attributes: unknown
  contractAddress: string;
  decimals: number;
  description: string;
  image: string;
  name: string;
  properties: {artist: string, baseCardId: number, cardType: string, element: string, health: number, power: number, mana: number, type: string}
  tokenId: string;
  selected: boolean;
}
