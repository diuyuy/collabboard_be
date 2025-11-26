import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Response } from 'express';
import { AUTH_ENV } from 'src/core/config/auth-env';
import { EnvSchema } from 'src/core/config/validateEnv';
import { COOKIE_NAME } from 'src/core/constants/cookie-name';

@Injectable()
export class CookieService {
  constructor(private readonly configService: ConfigService<EnvSchema, true>) {}

  setCookie(
    res: Response,
    accessToken: string,
    refreshToken: string,
    isSignIn: boolean = true,
  ) {
    res.cookie(
      COOKIE_NAME.ACCESS_TOKEN,
      accessToken,
      isSignIn ? this.getAccessTokenCookieOption() : this.getSignOutOptions(),
    );

    res.cookie(
      COOKIE_NAME.REFRESH_TOKE,
      refreshToken,
      isSignIn ? this.getRefreshTokenCookieOption() : this.getSignOutOptions(),
    );
  }

  private getAccessTokenCookieOption(): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      maxAge: this.configService.get<number>(AUTH_ENV.AUTH_EXPIRATION_MILLS),
      sameSite: this.configService.get<'lax' | 'none'>(
        AUTH_ENV.AUTH_COOKIE_SAME_SITE,
      ),
    };
  }

  private getRefreshTokenCookieOption(): CookieOptions {
    const expireDate = new Date();
    expireDate.setDate(
      expireDate.getDate() +
        this.configService.get<number>(
          AUTH_ENV.AUTH_REFRESH_TOKEN_EXPIRATION_DAYS,
        ),
    );

    return {
      httpOnly: true,
      secure: true,
      expires: expireDate,
      sameSite: this.configService.get<'lax' | 'none'>(
        AUTH_ENV.AUTH_COOKIE_SAME_SITE,
      ),
    };
  }

  private getSignOutOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: true,
      maxAge: 0,
      sameSite: this.configService.get<'lax' | 'none'>(
        AUTH_ENV.AUTH_COOKIE_SAME_SITE,
      ),
    };
  }
}
