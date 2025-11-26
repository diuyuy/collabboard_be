import { IsEmail, IsNotEmpty, Length } from 'class-validator';

export class CreateMemberDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(8, 20)
  password: string;
}
