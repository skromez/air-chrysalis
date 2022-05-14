import type { sequence } from '0xsequence';
import axios from 'axios';
import type { AuthResponse } from '../types/auth-response';
import jwtDecode from 'jwt-decode';

export class SequenceService {
  private static readonly axiosInstance = axios.create({baseURL: 'https://api.sequence.app/rpc/API'})

  static async authenticate(wallet: sequence.Wallet): Promise<AuthResponse> {
    const connectDetails = await wallet.connect({
      app: 'Air Chrysalis',
      authorize: true,
      networkId: 137,
    })
    const { data } : {data: AuthResponse} = await this.axiosInstance.post('/GetAuthToken', {
      ewtString: connectDetails.proof.proofString,
      testnetMode: false
    })

    localStorage.setItem('jwt', data.jwtToken)
    const jwt = jwtDecode(data.jwtToken) as {exp: number}
    localStorage.setItem('expiresAt', String(jwt.exp))
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.jwtToken}`;
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.jwtToken}`;
    return data
  }
}
