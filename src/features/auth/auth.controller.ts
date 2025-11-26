import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from 'src/core/api-response/api-response';
import { CookieService } from '../../core/infrastructure/cookie/cookie.service';
import { MemberResponseDto } from '../member/dto/member-response.dto';
import { AuthService } from './auth.service';
import { IsPublic } from './decorator/public';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { RequestWithUser } from './types/types';

@IsPublic()
@Controller('v1/auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookieService: CookieService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('sign-in')
  async signInByEmailPassword(
    @Req() req: RequestWithUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<ApiResponse<MemberResponseDto>> {
    const { accessToken, memberResponseDto } =
      await this.authService.signInByEmailPassword(BigInt(req.user.id));

    this.cookieService.setCookie(res, accessToken, '', true);

    return ApiResponse.success(memberResponseDto);
  }

  @Post('sign-up')
  async signUp(@Body() signUpRequestDto: SignUpRequestDto) {}
}
