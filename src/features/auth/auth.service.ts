import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Member } from 'generated/prisma/client';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { MemberResponseDto } from '../member/dto/member-response.dto';
import { MemberService } from '../member/member.service';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { MemberInfo } from './types/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly memberService: MemberService,
    private readonly jwtService: JwtService,
  ) {}

  private readonly SALT_OR_AROUNDS = 10;

  async signInByEmailPassword(
    memberId: bigint,
  ): Promise<{ accessToken: string; memberResponseDto: MemberResponseDto }> {
    const memberResponseDto = await this.memberService.findById(memberId);

    if (!memberResponseDto)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MEMBER_NOT_FOUND),
      );

    const accessToken = this.generateAccessToken({
      id: memberResponseDto.id,
      role: memberResponseDto.role,
    });

    return { accessToken, memberResponseDto };
  }

  async signUp(signUpRequestDto: SignUpRequestDto) {}

  async validateUser(email: string, password: string): Promise<Member | null> {
    const member = await this.memberService.findByEmail(email);

    if (!member || !member.password) return null;

    return (await bcrypt.compare(password, member.password)) ? member : null;
  }

  private generateAccessToken({ id, role }: MemberInfo): string {
    const payload = { sub: id, role };

    return this.jwtService.sign(payload);
  }
}
