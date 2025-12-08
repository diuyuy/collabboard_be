import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions, Request, Response } from 'express';
import { AUTH_ENV } from 'src/core/config/auth-env';
import { EnvSchema } from 'src/core/config/validateEnv';
import { COOKIE_NAME } from 'src/core/constants/cookie-name';

type SetCookieOption = 'SIGN_OUT' | 'SIGN_IN' | 'REFRESH_TOKEN';
@Injectable()
export class CookieService {
  constructor(private readonly configService: ConfigService<EnvSchema, true>) {}

  setCookie(
    res: Response,
    accessToken: string,
    refreshToken: string,
    setCookieOption: SetCookieOption,
  ) {
    res.cookie(
      COOKIE_NAME.ACCESS_TOKEN,
      accessToken,
      setCookieOption === 'SIGN_OUT'
        ? this.getSignOutOptions()
        : this.getAccessTokenCookieOption(),
    );

    res.cookie(
      COOKIE_NAME.REFRESH_TOKEN,
      refreshToken,
      setCookieOption === 'SIGN_OUT'
        ? this.getSignOutOptions()
        : this.getRefreshTokenCookieOption(),
    );
  }

  getCookie(req: Request, isRefreshToken: boolean = true): string | null {
    const token = isRefreshToken
      ? (req.cookies[COOKIE_NAME.REFRESH_TOKEN] as string | undefined)
      : (req.cookies[COOKIE_NAME.ACCESS_TOKEN] as string | undefined);

    return token ?? null;
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
        +this.configService.get<string>(
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
