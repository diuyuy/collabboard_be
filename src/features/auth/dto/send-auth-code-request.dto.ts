import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendVerificationCodeRequestDto {
  @ApiProperty({
    description: 'Email address to receive the verification code',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
