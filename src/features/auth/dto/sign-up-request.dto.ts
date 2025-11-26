import { IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class SignUpRequestDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(8, 20)
  password: string;

  @Matches(/^\d{6}$/)
  authCode: string;
}
