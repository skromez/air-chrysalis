import type { sequence } from '0xsequence';
import axios from 'axios';
import type { AuthResponse } from '../types/auth-response';

export class SequenceService {
  private static readonly axiosInstance = axios.create({baseURL: 'https://api.sequence.app/rpc/API'})

  static async authenticate(wallet: sequence.Wallet): Promise<AuthResponse> {
    const connectDetails = await wallet.connect({
      app: 'Air Crhysalis',
      authorize: true,
    })
    const { data } : {data: AuthResponse} = await this.axiosInstance.post('/GetAuthToken', {
      ewtString: connectDetails.proof.proofString,
      testnetMode: false
    })
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.jwtToken}`;
    return data
  }
}
