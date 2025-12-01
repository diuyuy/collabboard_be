import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { PASSPORT_STRATEGY_NAME } from 'src/core/constants/passport-strategy-name';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { IS_PUBLIC } from '../decorator/public';

@Injectable()
export class JwtAuthGuard extends AuthGuard(PASSPORT_STRATEGY_NAME.JWT) {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const requestType = context.getType();

    if (requestType === 'ws') return true; // websocket 인증은 게이트웨이에서 처리

    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(
      IS_PUBLIC,
      [context.getClass(), context.getHandler()],
    );

    if (isPublic) return true;

    return super.canActivate(context);
  }

  handleRequest<MemberInfo>(
    error: any,
    user: MemberInfo | undefined,
  ): MemberInfo {
    if (error || !user) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.INVALID_JWT_TOKEN),
      );
    }

    return user;
  }
}
