import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { PASSPORT_STRATEGY_NAME } from 'src/core/constants/passport-strategy-name';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { AuthService } from '../auth.service';
import { MemberInfo } from '../types/types';

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  PASSPORT_STRATEGY_NAME.LOCAL,
) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }

  async validate(email: string, password: string): Promise<MemberInfo> {
    const member = await this.authService.validateUser(email, password);

    if (!member) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.INVALID_AUTH_FORMAT),
      );
    }

    return { id: String(member.id), role: member.role };
  }
}
