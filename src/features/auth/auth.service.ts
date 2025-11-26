import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'crypto';
import { Member } from 'generated/prisma/client';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { AUTH_ENV } from 'src/core/config/auth-env';
import { EnvSchema } from 'src/core/config/validateEnv';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { EmailService } from 'src/core/infrastructure/email/email.service';
import { IoRedisService } from 'src/core/infrastructure/io-redis/io-redis.service';
import { v4 as uuidv4 } from 'uuid';
import { MemberResponseDto } from '../member/dto/member-response.dto';
import { MemberService } from '../member/member.service';
import { SignUpRequestDto } from './dto/sign-up-request.dto';
import { AuthTokens, MemberInfo } from './types/types';

@Injectable()
export class AuthService {
  constructor(
    private readonly memberService: MemberService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService<EnvSchema, true>,
    private readonly ioRedisService: IoRedisService,
  ) {}

  private readonly SALT_OR_AROUNDS = 10;

  async signInByEmailPassword(memberId: bigint): Promise<
    AuthTokens & {
      memberResponseDto: MemberResponseDto;
    }
  > {
    const memberResponseDto = await this.memberService.findById(memberId);

    if (!memberResponseDto)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MEMBER_NOT_FOUND),
      );

    const accessToken = this.generateAccessToken({
      id: memberResponseDto.id,
      role: memberResponseDto.role,
    });

    const refreshToken = await this.generateRefreshToken({
      id: String(memberId),
      role: memberResponseDto.role,
    });

    return { accessToken, refreshToken, memberResponseDto };
  }

  async signUp({ email, password, authCode }: SignUpRequestDto): Promise<void> {
    await this.validateAuthCode(email, authCode);
    await this.ioRedisService.del(this.generateAuthCodeKey(email));

    const hashedPassword = await bcrypt.hash(password, this.SALT_OR_AROUNDS);

    await this.memberService.create({ email, password: hashedPassword });
  }

  async signOut(refreshToken: string): Promise<void> {
    const refreshTokenKey = this.generateRefreshTokenKey(refreshToken);
    const memberInfoJson = await this.ioRedisService.get(refreshTokenKey);

    if (memberInfoJson) {
      const memberInfo = JSON.parse(memberInfoJson) as MemberInfo;
      await this.ioRedisService.srem(
        this.generateMemberTokenKey(memberInfo.id),
        refreshToken,
      );
    }

    await this.ioRedisService.del(refreshTokenKey);
  }

  async validateUser(email: string, password: string): Promise<Member | null> {
    const member = await this.memberService.findByEmail(email);

    if (!member || !member.password) return null;

    return (await bcrypt.compare(password, member.password)) ? member : null;
  }

  async sendAuthCodeEmail(email: string): Promise<void> {
    const authCode = randomInt(1000000).toString().padStart(6, '0');

    try {
      await this.ioRedisService.set(
        this.generateAuthCodeKey(email),
        authCode,
        3 * 60 + 30, // 이메일 전송 시간 고려
      );
    } catch {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.SEND_EMAIL_FAIL),
      );
    }
    await this.emailService.sendAuthCodeEmail(email, authCode);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const refreshTokenKey = this.generateRefreshTokenKey(refreshToken);
    const memberInfoJson = await this.ioRedisService.get(refreshTokenKey);

    if (!memberInfoJson)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.INVALID_REFRESH_TOKEN),
      );

    const memberInfo = JSON.parse(memberInfoJson) as MemberInfo;

    const accessToken = this.generateAccessToken(memberInfo);
    const newRefreshToken = await this.generateRefreshToken(memberInfo);

    // 기존에 저장되어 있던 refreshToken 및 memberInfo 삭제
    await Promise.all([
      this.ioRedisService.del(refreshTokenKey),
      this.ioRedisService.srem(
        this.generateMemberTokenKey(memberInfo.id),
        refreshToken,
      ),
    ]);

    return { accessToken, refreshToken: newRefreshToken };
  }

  private async validateAuthCode(email: string, authCode: string) {
    const storedAuthCode = await this.ioRedisService.get(
      this.generateAuthCodeKey(email),
    );

    if (!storedAuthCode || storedAuthCode !== authCode) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.INVALID_AUTH_CODE),
      );
    }
  }

  private generateAccessToken({ id, role }: MemberInfo): string {
    const payload = { sub: id, role };

    return this.jwtService.sign(payload);
  }

  private async generateRefreshToken(memberInfo: MemberInfo): Promise<string> {
    const refreshToken = uuidv4();
    const expireDay = this.configService.get<number>(
      AUTH_ENV.AUTH_REFRESH_TOKEN_EXPIRATION_DAYS,
    );

    const ttlSeconds = expireDay * 24 * 3600;

    await Promise.all([
      this.ioRedisService.set(
        this.generateRefreshTokenKey(refreshToken),
        JSON.stringify(memberInfo),
        ttlSeconds,
      ),
      this.ioRedisService.sadd(
        this.generateMemberTokenKey(memberInfo.id),
        refreshToken,
      ),
    ]);

    await this.ioRedisService.expire(
      this.generateMemberTokenKey(memberInfo.id),
      ttlSeconds,
    );

    return refreshToken;
  }

  private generateAuthCodeKey(email: string): string {
    return `AUTH_CODE:${email}`;
  }

  private generateRefreshTokenKey(refreshToken: string): string {
    return `REFRESH:${refreshToken}`;
  }

  private generateMemberTokenKey(memberId: string): string {
    return `MEMBER_TOKEN:${memberId}`;
  }
}
