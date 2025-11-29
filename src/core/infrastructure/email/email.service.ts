import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { renderFile } from 'ejs';
import { createTransport } from 'nodemailer';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { EMAIL_ENV } from 'src/core/config/email-env';
import { EnvSchema } from 'src/core/config/validateEnv';
import { EMAIL_SUBJECT, HTML_PATH } from 'src/core/constants/email-constants';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { HtmlType } from './types/html-type';

@Injectable()
export class EmailService {
  private readonly transporter: ReturnType<typeof createTransport>;
  constructor(private readonly configService: ConfigService<EnvSchema, true>) {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: configService.get<string>(EMAIL_ENV.EMAIL_GOOGLE_ID),
        pass: configService.get<string>(EMAIL_ENV.EMAIL_GOOGLE_APP_PASSWORD),
      },
    });
  }

  async sendVerifycationCodeEmail(email: string, verifycationCode: string) {
    try {
      const html = await this.generateHtml({
        filename: HTML_PATH.AUTH_CODE_EMAIL,
        values: { verifycationCode },
      });

      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_GOOGLE_ID'),
        to: email,
        subject: EMAIL_SUBJECT.VALIDATE_AUTH_CODE,
        html,
      });
    } catch (error) {
      console.error(error);
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.SEND_EMAIL_FAIL),
      );
    }
  }

  async sendResetPasswordEmail(email: string, authToken: string) {
    const redirectUrl = new URL(
      this.configService.get<string>(EMAIL_ENV.EMAIL_RESET_PASSWD_REDIRECT_URL),
    );

    redirectUrl.searchParams.append('authToken', authToken);

    try {
      const html = await this.generateHtml({
        filename: HTML_PATH.PASSWD_RESET,
        values: {
          redirectUrl: redirectUrl.href,
        },
      });

      await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_GOOGLE_ID'),
        to: email,
        subject: EMAIL_SUBJECT.PASSWORD_RESET,
        html,
      });
    } catch (error) {
      console.error(`Send reset password mail error: ${error}`);
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.SEND_EMAIL_FAIL),
      );
    }
  }

  private async generateHtml({ filename, values }: HtmlType) {
    return renderFile(filename, values);
  }
}
