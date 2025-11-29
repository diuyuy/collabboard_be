import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, Length } from 'class-validator';
import { APP_CONSTANTS } from 'src/core/constants/app-constants';

export class PasswdResetRequestDto {
  @ApiProperty({
    description: 'Password reset authentication token (UUID format)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  authToken: string;

  @ApiProperty({
    description: 'New password',
    example: 'newPassword123',
    minLength: APP_CONSTANTS.PASSWORD_MIN_LENGTH,
    maxLength: APP_CONSTANTS.PASSWORD_MAX_LENGTH,
  })
  @Length(APP_CONSTANTS.PASSWORD_MIN_LENGTH, APP_CONSTANTS.PASSWORD_MAX_LENGTH)
  password: string;
}
