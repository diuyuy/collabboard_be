import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Length, Matches } from 'class-validator';
import { APP_CONSTANTS } from 'src/core/constants/app-constants';

export class SignUpRequestDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'password123',
    minLength: APP_CONSTANTS.PASSWORD_MIN_LENGTH,
    maxLength: APP_CONSTANTS.PASSWORD_MAX_LENGTH,
  })
  @Length(APP_CONSTANTS.PASSWORD_MIN_LENGTH, APP_CONSTANTS.PASSWORD_MAX_LENGTH)
  password: string;

  @ApiProperty({
    description: '6-digit email verification code',
    example: '123456',
    pattern: '^\\d{6}$',
  })
  @Matches(/^\d{6}$/)
  verifycationCode: string;
}
