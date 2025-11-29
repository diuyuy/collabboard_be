import { IsEmail, IsNotEmpty, Length } from 'class-validator';
import { APP_CONSTANTS } from 'src/core/constants/app-constants';

export class CreateMemberDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @Length(APP_CONSTANTS.PASSWORD_MIN_LENGTH, APP_CONSTANTS.PASSWORD_MAX_LENGTH)
  password: string;
}
