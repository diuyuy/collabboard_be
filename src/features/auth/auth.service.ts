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
import { EMAIL_CONSTANTS } from 'src/core/constants/email-constants';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { EmailService } from 'src/core/infrastructure/email/email.service';
import { IoRedisService } from 'src/core/infrastructure/io-redis/io-redis.service';
import { v4 as uuidv4 } from 'uuid';
import { MemberResponseDto } from '../member/dto/member-response.dto';
import { MemberService } from '../member/member.service';
import { PasswdResetRequestDto } from './dto/passwd-reset-request.dto';
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

  async signInByEmailPassword(memberId: string): Promise<
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
      id: memberId,
      role: memberResponseDto.role,
    });

    return { accessToken, refreshToken, memberResponseDto };
  }

  async signUp({
    email,
    password,
    verificationCode,
  }: SignUpRequestDto): Promise<void> {
    await this.validateVerificationCode(email, verificationCode);
    await this.ioRedisService.del(this.generateVerificationCodeKey(email));

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

  // 이메일 패스워드로 로그인 시 이메일 패스워드 유효한 지 체크하는 메서드
  async validateUser(email: string, password: string): Promise<Member | null> {
    const member = await this.memberService.findByEmail(email);

    if (!member || !member.password) return null;

    return (await bcrypt.compare(password, member.password)) ? member : null;
  }

  async sendVerificationCodeEmail(email: string): Promise<void> {
    const isEmailExists = await this.checkEmailExists(email);

    if (isEmailExists)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.EMAIL_ALREADY_EXSITS),
      );

    const verificationCode = randomInt(1000000).toString().padStart(6, '0');

    try {
      await this.ioRedisService.set(
        this.generateVerificationCodeKey(email),
        verificationCode,
        'EX',
        EMAIL_CONSTANTS.VERIFICATION_CODE_TTLSECONDS,
      );
    } catch {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.SEND_EMAIL_FAIL),
      );
    }
    await this.emailService.sendVerificationCodeEmail(email, verificationCode);
  }

  async checkEmailExists(email: string): Promise<boolean> {
    const member = await this.memberService.findByEmail(email);

    return !!member;
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

    // 기존에 저장되어 있던 refreshToken 삭제
    await Promise.all([
      this.ioRedisService.del(refreshTokenKey),
      this.ioRedisService.srem(
        this.generateMemberTokenKey(memberInfo.id),
        refreshToken,
      ),
    ]);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async revokeAllRefreshTokens(memberId: string): Promise<void> {
    const memberTokenKey = this.generateMemberTokenKey(memberId);

    const storedRefreshTokens =
      await this.ioRedisService.smembers(memberTokenKey);

    if (storedRefreshTokens.length === 0) return;

    await Promise.all([
      ...storedRefreshTokens.map((token) =>
        this.ioRedisService.del(this.generateRefreshTokenKey(token)),
      ),
      this.ioRedisService.del(memberTokenKey),
    ]);
  }

  async sendResetPasswordEmail(email: string) {
    const member = await this.memberService.findByEmail(email);

    if (!member)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.EMAIL_NOT_FOUND),
      );

    const authToken = uuidv4();

    try {
      await this.ioRedisService.set(
        this.generateAuthTokenKey(authToken),
        email,
        'EX',
        EMAIL_CONSTANTS.AUTH_TOKEN_TTLSECONDS,
      );
    } catch {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.SEND_EMAIL_FAIL),
      );
    }
    await this.emailService.sendResetPasswordEmail(email, authToken);
  }

  async resetPassword({
    authToken,
    password,
  }: PasswdResetRequestDto): Promise<void> {
    const authTokenKey = this.generateAuthTokenKey(authToken);
    const email = await this.ioRedisService.get(authTokenKey);

    if (!email)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.INVALID_AUTH_TOKEN),
      );

    const [, hashResult] = await Promise.allSettled([
      this.ioRedisService.del(authTokenKey),
      bcrypt.hash(password, this.SALT_OR_AROUNDS),
    ]);

    if (hashResult.status === 'rejected') {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.HASH_PASSWORD_FAIL),
      );
    }

    await this.memberService.updatePassword(email, hashResult.value);
  }

  private async validateVerificationCode(
    email: string,
    verificationCode: string,
  ) {
    const storedVerificationCode = await this.ioRedisService.get(
      this.generateVerificationCodeKey(email),
    );

    if (
      !storedVerificationCode ||
      storedVerificationCode !== verificationCode
    ) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.INVALID_VERIFYCATION_CODE),
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

    const memberTokenKey = this.generateMemberTokenKey(memberInfo.id);

    await Promise.all([
      this.ioRedisService.set(
        this.generateRefreshTokenKey(refreshToken),
        JSON.stringify(memberInfo),
        'EX',
        ttlSeconds,
      ),
      this.ioRedisService.sadd(memberTokenKey, refreshToken),
    ]);

    await this.ioRedisService.expire(memberTokenKey, ttlSeconds);

    return refreshToken;
  }

  private generateVerificationCodeKey(email: string): string {
    return `VERIFICATION_CODE:${email}`;
  }

  private generateAuthTokenKey(authToken: string): string {
    return `AUTH_TOKEN:${authToken}`;
  }

  private generateRefreshTokenKey(refreshToken: string): string {
    return `REFRESH:${refreshToken}`;
  }

  private generateMemberTokenKey(memberId: string): string {
    return `MEMBER_TOKEN:${memberId}`;
  }
}
