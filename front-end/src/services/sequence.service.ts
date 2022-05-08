import type { sequence } from '0xsequence';
import { Claims, ETHAuth, Proof, validateClaims } from '@0xsequence/ethauth';
import axios from 'axios';
import type { AuthData } from '../types/auth-data';
import { ethers } from 'ethers';
import { add } from 'lodash';

export class SequenceService {
  private static readonly axiosInstance = axios.create({baseURL: 'https://api.sequence.app/rpc/API'})

  static async authenticate(wallet: sequence.Wallet): Promise<AuthData> {
    const connectDetails = await wallet.connect({
      app: 'Air Crhysalis',
      authorize: true,
    })
    console.log(connectDetails)
    const { data } : {data: AuthData} = await this.axiosInstance.post('/GetAuthToken', {
      // ewtString: connectDetails.proof.proofString,
      ewtString: 'eth.0xd19af56c68927fa476160ce600a44e22fdff92f9.eyJhcHAiOiJTZXF1ZW5jZSBXYWxsZXQiLCJpYXQiOjAsImV4cCI6MTY1NDU1NjY5MCwidiI6IjEifQ.0x0005000313d4dbcdb13c453625e7c0227953097e8d039118c62f04940b7f46059104366434f95ff3794786d010938f1a2039f92f7169ca58ed235739ac49b9693f8c11a71c020003c1f2b4a0e80520fac0ec1f4dc9d031cc09647c63f80654ec78b58ad19e21fd042a542080c3a70a7c7c9380b806e26dce78fb430751fdf7b0286a25662b321a8f1b020002715278ed374b9e89bd9a87704f076213daa1bd3c0a9eb005f18a2de81719e59e5f2d4c9b5acccd71989699411d5404207353fd5f0a9bf7f0aa26f3a83baf1d191b02',
      testnetMode: true
    })
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${data.jwtToken}`;
    return data
  }
}
