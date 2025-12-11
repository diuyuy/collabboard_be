import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { AUTH_ENV } from 'src/core/config/auth-env';
import { EnvSchema } from 'src/core/config/validateEnv';
import { CookieModule } from 'src/core/infrastructure/cookie/cookie.module';
import { EmailModule } from 'src/core/infrastructure/email/email.module';
import { MemberModule } from '../member/member.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { JwtStrategy } from './strategy/jwt-strategy';
import { LocalStrategy } from './strategy/local-strategy';

@Module({
  imports: [
    CookieModule,
    EmailModule,
    MemberModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<EnvSchema, true>) => ({
        secret: configService.get<string>(AUTH_ENV.AUTH_SECRET),
        signOptions: {
          expiresIn: +configService.get<string>(AUTH_ENV.AUTH_EXPIRATION_MILLS),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    LocalStrategy,
    LocalAuthGuard,
  ],
})
export class AuthModule {}
