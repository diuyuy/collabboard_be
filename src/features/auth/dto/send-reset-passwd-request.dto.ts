import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class SendResetPasswdRequestDto {
  @ApiProperty({
    description: 'Email address to receive the password reset link',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}
