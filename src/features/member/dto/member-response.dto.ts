import { Member } from 'generated/prisma/client';
import { Member_role } from 'generated/prisma/enums';

export class MemberResponseDto {
  id: string;
  email: string;
  role: Member_role;
  nickname: string | null;

  constructor(memberResponse: MemberResponseDto) {
    this.id = memberResponse.id;
    this.email = memberResponse.email;
    this.role = memberResponse.role;
    this.nickname = memberResponse.nickname;
  }

  static from({ id, email, role, nickname }: Member): MemberResponseDto {
    return new MemberResponseDto({
      id: String(id),
      email,
      role,
      nickname,
    });
  }
}
