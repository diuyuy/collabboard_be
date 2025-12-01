import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiQuery,
  ApiResponse as ApiResponseDecorator,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ApiResponse } from 'src/core/api-response/api-response';
import { ResponseCode } from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { ParseEmailPipe } from 'src/core/pipes/parse-email-pipe';
import { ResponseStatusFactory } from '../../core/api-response/response-status';
import { CookieService } from '../../core/infrastructure/cookie/cookie.service';
import { MemberResponseDto } from '../member/dto/member-response.dto';
import { AuthService } from './auth.service';
import { IsPublic } from './decorator/public';
import { PasswdResetRequestDto } from './dto/passwd-reset-request.dto';
import { SendVerificationCodeRequestDto } from './dto/send-auth-code-request.dto';
import { SendResetPasswdRequestDto } from './dto/send-reset-passwd-request.dto';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RequestWithUser } from './types/types';

@ApiTags('Authentication')
@ApiExtraModels(MemberResponseDto)
@IsPublic()
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @ApiOperation({ summary: 'Email/Password Sign In' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', example: 'user@example.com' },
        password: { type: 'string', example: 'password123' },
      },
      required: ['email', 'password'],
    },
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Successful sign-in',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(MemberResponseDto) },
          },
        },
      ],
    },
  })
  @ApiResponseDecorator({
    status: 401,
    description: 'Authentication failure',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        code: { type: 'string', example: ResponseCode.INVALID_AUTH_FORMAT },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(
            ResponseCode.INVALID_AUTH_FORMAT,
          ).message,
        },
      },
    },
  })
  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signInByEmailPassword(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<MemberResponseDto>> {
    const { accessToken, refreshToken, memberResponseDto } =
      await this.authService.signInByEmailPassword(req.user.id);

    this.cookieService.setCookie(res, accessToken, refreshToken, 'SIGN_IN');

    return ApiResponse.success(memberResponseDto);
  }

  @ApiOperation({ summary: 'Sign Up' })
  @ApiResponseDecorator({
    status: 201,
    description: 'Successful sign-up',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        code: { type: 'string', example: 'OK' },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.MEMBER_CREATED)
            .message,
        },
      },
    },
  })
  @ApiResponseDecorator({
    status: 400,
    description: 'Bad Request (Invalid verification code or existing email)',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        code: {
          type: 'string',
          example: ResponseCode.INVALID_VERIFYCATION_CODE,
        },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(
            ResponseCode.INVALID_VERIFYCATION_CODE,
          ).message,
        },
      },
    },
  })
  @Post('sign-up')
  async signUp(
    @Body() signUpRequestDto: SignUpRequestDto,
  ): Promise<ApiResponse<void>> {
    await this.authService.signUp(signUpRequestDto);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.MEMBER_CREATED),
    );
  }

  @ApiOperation({ summary: 'Sign Out' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Successful sign-out',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        code: { type: 'string', example: 'OK' },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @ApiResponseDecorator({
    status: 400,
    description: 'Refresh token does not exist',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        code: { type: 'string', example: 'REFRESH_TOKEN_NOT_EXISTS' },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(
            ResponseCode.REFRESH_TOKEN_NOT_EXISTS,
          ).message,
        },
      },
    },
  })
  @Post('sign-out')
  async signOut(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<void>> {
    const refreshToken = this.cookieService.getCookie(req);

    if (!refreshToken)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.REFRESH_TOKEN_NOT_EXISTS),
      );

    await this.authService.signOut(refreshToken);
    this.cookieService.setCookie(res, '', '', 'SIGN_OUT');

    return ApiResponse.success();
  }

  @ApiOperation({ summary: 'Check Email Availability' })
  @ApiQuery({
    name: 'email',
    type: String,
    description: 'Email address to check',
    example: 'user@example.com',
  })
  @ApiResponseDecorator({
    status: 200,
    description: 'Successful email availability check',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { type: 'boolean', example: true },
          },
        },
      ],
    },
  })
  @ApiResponseDecorator({
    status: 400,
    description: 'Invalid email format',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        code: { type: 'string', example: ResponseCode.INVALID_EMAIL_FORM },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.INVALID_EMAIL_FORM)
            .message,
        },
      },
    },
  })
  @Get('email-availability')
  async checkEmailAvaliablitity(
    @Query('email', ParseEmailPipe) email: string,
  ): Promise<ApiResponse<boolean>> {
    const isExists = await this.authService.checkEmailExists(email);

    return ApiResponse.success(!isExists);
  }

  @ApiOperation({ summary: 'Send Email Verification Code' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Verification code sent successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        code: { type: 'string', example: 'OK' },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @ApiResponseDecorator({
    status: 400,
    description: 'Bad Request (Invalid email)',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        code: { type: 'string', example: 'BAD_REQUEST' },
        message: { type: 'string', example: 'Bad request' },
      },
    },
  })
  @Post('verification-code')
  async sendVerificationCode(
    @Body() { email }: SendVerificationCodeRequestDto,
  ): Promise<ApiResponse<void>> {
    await this.authService.sendVerificationCodeEmail(email);

    return ApiResponse.success();
  }

  @ApiOperation({ summary: 'Send Password Reset Link' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Password reset link sent successfully',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        code: { type: 'string', example: 'OK' },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @ApiResponseDecorator({
    status: 400,
    description: 'Bad Request (Invalid email)',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        code: { type: 'string', example: 'BAD_REQUEST' },
        message: { type: 'string', example: 'Bad request' },
      },
    },
  })
  @Post('password-reset-link')
  async sendResetPasswordEmail(
    @Body() { email }: SendResetPasswdRequestDto,
  ): Promise<ApiResponse<void>> {
    await this.authService.sendResetPasswordEmail(email);

    return ApiResponse.success();
  }

  @ApiOperation({ summary: 'Refresh Access Token' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Token refresh successful',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        code: { type: 'string', example: 'OK' },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @ApiResponseDecorator({
    status: 400,
    description: 'Refresh token does not exist',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        code: {
          type: 'string',
          example: ResponseCode.REFRESH_TOKEN_NOT_EXISTS,
        },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(
            ResponseCode.REFRESH_TOKEN_NOT_EXISTS,
          ).message,
        },
      },
    },
  })
  @Post('refresh-token')
  async refreshToken(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<void>> {
    const oldRefreshToken = this.cookieService.getCookie(req);

    if (!oldRefreshToken)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.REFRESH_TOKEN_NOT_EXISTS),
      );

    const { accessToken, refreshToken } =
      await this.authService.refreshToken(oldRefreshToken);

    this.cookieService.setCookie(
      res,
      accessToken,
      refreshToken,
      'REFRESH_TOKEN',
    );

    return ApiResponse.success();
  }

  @ApiOperation({ summary: 'Password Reset' })
  @ApiResponseDecorator({
    status: 200,
    description: 'Password reset successful',
    schema: {
      properties: {
        success: { type: 'boolean', example: true },
        code: { type: 'string', example: 'OK' },
        message: {
          type: 'string',
          example: ResponseStatusFactory.create(ResponseCode.OK).message,
        },
      },
    },
  })
  @ApiResponseDecorator({
    status: 400,
    description: 'Bad Request (Invalid token or password)',
    schema: {
      properties: {
        success: { type: 'boolean', example: false },
        code: { type: 'string', example: 'BAD_REQUEST' },
        message: { type: 'string', example: 'Bad request' },
      },
    },
  })
  @Post('password-reset')
  async resetPassword(
    @Body() passwordResetRequestDto: PasswdResetRequestDto,
  ): Promise<ApiResponse<void>> {
    await this.authService.resetPassword(passwordResetRequestDto);

    return ApiResponse.success();
  }
}
