/* eslint-disable @typescript-eslint/unbound-method */
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { EMAIL_CONSTANTS } from 'src/core/constants/email-constants';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { EmailService } from 'src/core/infrastructure/email/email.service';
import { IoRedisService } from 'src/core/infrastructure/io-redis/io-redis.service';
import { v4 as uuidv4 } from 'uuid';
import { MemberService } from '../member/member.service';
import { AuthService } from './auth.service';

const MOCKED_VERIFICATION_CODE = '123456';

jest.mock('bcrypt');
jest.mock('crypto', () => ({
  randomInt: jest.fn(() => +MOCKED_VERIFICATION_CODE),
  randomUUID: jest.fn(() => 'test-uuid'),
}));
jest.mock('uuid');

describe('AuthService', () => {
  let authService: AuthService;
  let memberService: jest.Mocked<MemberService>;
  let jwtService: jest.Mocked<JwtService>;
  let emailService: jest.Mocked<EmailService>;
  let configService: jest.Mocked<ConfigService>;
  let ioRedisService: jest.Mocked<IoRedisService>;

  const memberId = 'member-id';
  const HASHED_PASSWORD = 'hashedPassword';
  const SALT_OR_AROUNDS = 10;
  const UUID = 'uuid';

  const mockedMemberResponseDto = {
    id: memberId,
    email: 'user1@example.com',
    role: 'USER',
    nickname: 'User1',
  } as const;

  const mockedMember = {
    ...mockedMemberResponseDto,
    password: 'hashedPassword',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    // Mock 객체 생성
    const mockMemberService = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      create: jest.fn(),
      updatePassword: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
      verify: jest.fn(),
    };

    const mockEmailService = {
      sendVerificationCodeEmail: jest.fn(),
      sendResetPasswordEmail: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockIoRedisService = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      srem: jest.fn(),
      sadd: jest.fn(),
      smembers: jest.fn(),
      expire: jest.fn(),
    };

    // TestingModule 생성
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: MemberService,
          useValue: mockMemberService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: IoRedisService,
          useValue: mockIoRedisService,
        },
      ],
    }).compile();

    // Service 인스턴스 가져오기
    authService = module.get<AuthService>(AuthService);
    memberService = module.get(MemberService);
    jwtService = module.get(JwtService);
    emailService = module.get(EmailService);
    configService = module.get(ConfigService);
    ioRedisService = module.get(IoRedisService);

    (bcrypt.hash as jest.Mock).mockResolvedValue(HASHED_PASSWORD);
    // (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (uuidv4 as jest.Mock).mockReturnValue(UUID);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('signInByEmailPassword', () => {
    it('should return access token, refresh token, and member info when sign in is successful', async () => {
      const accessToken = 'access-token';

      memberService.findById.mockResolvedValue(mockedMemberResponseDto);
      jwtService.sign.mockReturnValue(accessToken);
      configService.get.mockReturnValue(7);

      const result = await authService.signInByEmailPassword(memberId);

      expect(memberService.findById).toHaveBeenCalledWith(memberId);
      expect(jwtService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: memberId,
          role: mockedMemberResponseDto.role,
        }),
      );
      expect(result.accessToken).toBe(accessToken);
      expect(result.memberResponseDto).toEqual(mockedMemberResponseDto);
      expect(result).toHaveProperty('refreshToken');
    });

    it('should throw MEMBER_NOT_FOUND exception when member does not exist', async () => {
      const memberId = mockedMemberResponseDto.id;

      memberService.findById.mockResolvedValue(null);

      await expect(authService.signInByEmailPassword(memberId)).rejects.toThrow(
        CommonHttpException,
      );
    });
  });

  describe('signUp', () => {
    const email = mockedMemberResponseDto.email;
    const password = '12345678';
    const verificationCode = MOCKED_VERIFICATION_CODE;

    it('should create a new member when verification code is valid', async () => {
      ioRedisService.get.mockResolvedValue(verificationCode);

      await authService.signUp({ email, password, verificationCode });

      expect(ioRedisService.get).toHaveBeenCalledWith(
        `VERIFICATION_CODE:${email}`,
      );
      expect(ioRedisService.del).toHaveBeenCalledWith(
        `VERIFICATION_CODE:${email}`,
      );
      expect(bcrypt.hash).toHaveBeenCalledWith(password, SALT_OR_AROUNDS);
      expect(memberService.create).toHaveBeenCalledWith({
        email,
        password: HASHED_PASSWORD,
      });
    });

    it('should throw exception when verification code is invalid', async () => {
      const storedVerificationCode = '654321';

      ioRedisService.get
        .mockResolvedValueOnce(storedVerificationCode)
        .mockResolvedValueOnce(null);

      await expect(
        authService.signUp({ email, password, verificationCode }),
      ).rejects.toThrow(CommonHttpException);

      await expect(
        authService.signUp({ email, password, verificationCode }),
      ).rejects.toThrow(CommonHttpException);
    });
  });

  describe('signOut', () => {
    const refreshToken = 'refresh-token';
    it('should delete refresh tokens from Redis', async () => {
      const memberInfoJson = JSON.stringify({
        id: mockedMemberResponseDto.id,
        role: mockedMemberResponseDto.role,
      });

      ioRedisService.get.mockResolvedValue(memberInfoJson);

      await authService.signOut(refreshToken);

      expect(ioRedisService.srem).toHaveBeenCalledWith(
        `MEMBER_TOKEN:${memberId}`,
        refreshToken,
      );
      expect(ioRedisService.del).toHaveBeenCalledWith(
        `REFRESH:${refreshToken}`,
      );
    });

    it('should handle signout when refresh token does not exist in Redis', async () => {
      ioRedisService.get.mockResolvedValue(null);

      await authService.signOut(refreshToken);

      expect(ioRedisService.del).toHaveBeenCalledWith(
        `REFRESH:${refreshToken}`,
      );
    });
  });

  describe('validateUser', () => {
    const email = mockedMemberResponseDto.email;
    const password = '12345678';
    it('should return member when email and password are correct', async () => {
      memberService.findByEmail.mockResolvedValue(mockedMember);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser(email, password);

      expect(result).toEqual(mockedMember);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        mockedMember.password,
      );
    });

    it('should return null when member does not exist', async () => {
      memberService.findByEmail.mockResolvedValue(null);

      const result = await authService.validateUser(email, password);

      expect(result).toBe(null);
      expect(memberService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should return null when password does not match', async () => {
      memberService.findByEmail.mockResolvedValue(mockedMember);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser(email, password);

      expect(result).toBe(null);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        password,
        mockedMember.password,
      );
    });

    it('should return null when member has no password', async () => {
      const member = {
        ...mockedMember,
        password: null,
      };

      memberService.findByEmail.mockResolvedValue(member);

      const result = await authService.validateUser(email, password);

      expect(result).toBe(null);
      expect(memberService.findByEmail).toHaveBeenCalledWith(email);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('sendVerificationCodeEmail', () => {
    const email = mockedMemberResponseDto.email;

    it('should send verification code email and store code in Redis', async () => {
      memberService.findByEmail.mockResolvedValue(null);

      await authService.sendVerificationCodeEmail(email);

      expect(ioRedisService.set).toHaveBeenCalledWith(
        `VERIFICATION_CODE:${email}`,
        MOCKED_VERIFICATION_CODE,
        'EX',
        EMAIL_CONSTANTS.VERIFICATION_CODE_TTLSECONDS,
      );
      expect(emailService.sendVerificationCodeEmail).toHaveBeenCalledWith(
        email,
        MOCKED_VERIFICATION_CODE,
      );
    });

    it('should throw EMAIL_ALREADY_EXISTS exception when email already exists', async () => {
      expect.assertions(2);
      memberService.findByEmail.mockResolvedValue(mockedMember);

      try {
        await authService.sendVerificationCodeEmail(email);
      } catch (e) {
        expect(e).toBeInstanceOf(CommonHttpException);
        expect((e as CommonHttpException).getResponse()).toEqual(
          ResponseStatusFactory.create(ResponseCode.EMAIL_ALREADY_EXSITS),
        );
      }
    });
    it('should throw SEND_EMAIL_FAIL exception when Redis set operation fails', async () => {
      expect.assertions(2);

      memberService.findByEmail.mockResolvedValue(null);
      ioRedisService.set.mockRejectedValue(new Error());

      try {
        await authService.sendVerificationCodeEmail(email);
      } catch (e) {
        expect(e).toBeInstanceOf(CommonHttpException);
        expect((e as CommonHttpException).getResponse()).toEqual(
          ResponseStatusFactory.create(ResponseCode.SEND_EMAIL_FAIL),
        );
      }
    });
  });

  describe('checkEmailExists', () => {
    const email = mockedMemberResponseDto.email;
    it('should return true when email exists', async () => {
      memberService.findByEmail.mockResolvedValue(mockedMember);

      const result = await authService.checkEmailExists(email);

      expect(result).toBe(true);
    });

    it('should return false when email does not exist', async () => {
      memberService.findByEmail.mockResolvedValue(null);

      const result = await authService.checkEmailExists(email);

      expect(result).toBe(false);
    });
  });

  describe('refreshToken', () => {
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';
    const memberInfoJson = JSON.stringify({
      id: mockedMemberResponseDto.id,
      role: mockedMemberResponseDto.role,
    });

    it('should return new access token and refresh token when refresh token is valid', async () => {
      ioRedisService.get.mockResolvedValue(memberInfoJson);
      jwtService.sign.mockReturnValue(accessToken);
      configService.get.mockReturnValue(7);

      const result = await authService.refreshToken(refreshToken);

      expect(result.accessToken).toBe(accessToken);
      expect(result).toHaveProperty('refreshToken');
      expect(ioRedisService.del).toHaveBeenCalledTimes(1);
      expect(ioRedisService.srem).toHaveBeenCalledTimes(1);
    });

    it('should throw INVALID_REFRESH_TOKEN exception when refresh token does not exist in Redis', async () => {
      ioRedisService.get.mockResolvedValue(null);

      expect.assertions(2);
      try {
        await authService.refreshToken(refreshToken);
      } catch (e) {
        expect(e).toBeInstanceOf(CommonHttpException);
        expect((e as CommonHttpException).getResponse()).toEqual(
          ResponseStatusFactory.create(ResponseCode.INVALID_REFRESH_TOKEN),
        );
      }
    });
  });

  describe('revokeAllRefreshTokens', () => {
    it('should delete all refresh tokens for a member', async () => {
      const storedRefreshTokens = Array.from({ length: 5 }).map(
        (_, idx) => `refresh-token${idx}`,
      );

      ioRedisService.smembers.mockResolvedValue(storedRefreshTokens);

      await authService.revokeAllRefreshTokens(memberId);

      expect(ioRedisService.smembers).toHaveBeenCalledWith(
        `MEMBER_TOKEN:${memberId}`,
      );

      expect(ioRedisService.del).toHaveBeenCalledTimes(
        storedRefreshTokens.length + 1,
      );

      storedRefreshTokens.forEach((token, idx) => {
        expect(ioRedisService.del).toHaveBeenNthCalledWith(
          idx + 1,
          `REFRESH:${token}`,
        );
      });

      expect(ioRedisService.del).toHaveBeenLastCalledWith(
        `MEMBER_TOKEN:${memberId}`,
      );
    });

    it('should handle case when member has no refresh tokens', async () => {
      const storedRefreshTokens: string[] = [];

      ioRedisService.smembers.mockResolvedValue(storedRefreshTokens);

      await authService.revokeAllRefreshTokens(memberId);

      expect(ioRedisService.del).not.toHaveBeenCalled();
    });
  });

  describe('sendResetPasswordEmail', () => {
    const email = mockedMemberResponseDto.email;

    it('should send reset password email and store auth token in Redis', async () => {
      memberService.findByEmail.mockResolvedValue(mockedMember);

      await authService.sendResetPasswordEmail(email);

      expect(ioRedisService.set).toHaveBeenCalledWith(
        `AUTH_TOKEN:${UUID}`,
        email,
        'EX',
        EMAIL_CONSTANTS.AUTH_TOKEN_TTLSECONDS,
      );

      expect(emailService.sendResetPasswordEmail).toHaveBeenCalledWith(
        email,
        UUID,
      );
    });

    it('should throw EMAIL_NOT_FOUND exception when email does not exist', async () => {
      memberService.findByEmail.mockResolvedValue(null);

      expect.assertions(2);
      try {
        await authService.sendResetPasswordEmail(email);
      } catch (e) {
        expect(e).toBeInstanceOf(CommonHttpException);
        expect((e as CommonHttpException).getResponse()).toEqual(
          ResponseStatusFactory.create(ResponseCode.EMAIL_NOT_FOUND),
        );
      }
    });

    it('should throw SEND_EMAIL_FAIL exception when Redis set operation fails', async () => {
      memberService.findByEmail.mockResolvedValue(mockedMember);
      ioRedisService.set.mockRejectedValue(new Error());

      expect.assertions(2);

      try {
        await authService.sendResetPasswordEmail(email);
      } catch (e) {
        expect(e).toBeInstanceOf(CommonHttpException);
        expect((e as CommonHttpException).getResponse()).toEqual(
          ResponseStatusFactory.create(ResponseCode.SEND_EMAIL_FAIL),
        );
      }
    });
  });

  describe('resetPassword', () => {
    const authToken = 'authToken';
    const password = '12345678';
    const email = mockedMemberResponseDto.email;

    it('should reset password when auth token is valid', async () => {
      ioRedisService.get.mockResolvedValue(email);

      await authService.resetPassword({ authToken, password });

      expect(ioRedisService.del).toHaveBeenCalledTimes(1);
      expect(memberService.updatePassword).toHaveBeenCalledWith(
        email,
        HASHED_PASSWORD,
      );
    });

    it('should throw INVALID_AUTH_TOKEN exception when auth token does not exist in Redis', async () => {
      ioRedisService.get.mockResolvedValue(null);

      expect.assertions(2);
      try {
        await authService.resetPassword({ authToken, password });
      } catch (e) {
        expect(e).toBeInstanceOf(CommonHttpException);
        expect((e as CommonHttpException).getResponse()).toEqual(
          ResponseStatusFactory.create(ResponseCode.INVALID_AUTH_TOKEN),
        );
      }
    });
  });
});
