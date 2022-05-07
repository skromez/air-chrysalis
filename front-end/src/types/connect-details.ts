export interface ConnectDetails {
  chainId: string;
  connected: boolean;
  proof: {
    proofString: string;
  }
}
