import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { MemberRole } from 'generated/prisma/enums';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AUTH_ENV } from 'src/core/config/auth-env';
import { EnvSchema } from 'src/core/config/validateEnv';
import { PASSPORT_STRATEGY_NAME } from 'src/core/constants/passport-strategy-name';
import { MemberInfo } from '../types/types';

type Payload = {
  sub: string;
  role: MemberRole;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(
  Strategy,
  PASSPORT_STRATEGY_NAME.JWT,
) {
  constructor(configService: ConfigService<EnvSchema, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return (req.cookies.accessToken as string | undefined) ?? null;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>(AUTH_ENV.AUTH_SECRET),
    });
  }

  validate({ sub, role }: Payload): MemberInfo {
    return { id: sub, role };
  }
}
