import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import * as sc2 from 'sc2-sdk';
import { HIVE_SIGNER_URL } from './constants';
import { ValidateRequestType } from './types';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }

  async validateRequest({
    headers,
    path,
  }: ValidateRequestType): Promise<boolean> {
    const [, , , name] = path.split('/');
    const account = headers.account || name;
    const token = headers['access-token'];

    if (!account || !token) return false;

    return this.validateHiveSigner(account, token);
  }

  async validateHiveSigner(account: string, token: string): Promise<boolean> {
    try {
      const api = sc2.Initialize({
        baseURL: HIVE_SIGNER_URL,
        accessToken: token,
      });
      const user = await api.me();
      return user._id === account;
    } catch (error) {
      return false;
    }
  }
}
