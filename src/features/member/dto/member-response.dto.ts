import { ApiProperty } from '@nestjs/swagger';
import { Member } from 'generated/prisma/client';
import { Member_role } from 'generated/prisma/enums';

export class MemberResponseDto {
  @ApiProperty({
    description: 'Unique member ID',
    example: '1234567890',
  })
  id: string;

  @ApiProperty({
    description: 'Member email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Member role',
    enum: Member_role,
    example: Member_role.USER,
  })
  role: Member_role;

  @ApiProperty({
    description: 'Member nickname',
    example: 'User1', // Note: Keeping the example as is, assuming it might be non-English
    nullable: true,
  })
  nickname: string | null;

  constructor(memberResponse: MemberResponseDto) {
    this.id = memberResponse.id;
    this.email = memberResponse.email;
    this.role = memberResponse.role;
    this.nickname = memberResponse.nickname;
  }

  static from(member: Member): MemberResponseDto {
    return new MemberResponseDto({
      ...member,
      id: String(member.id),
    });
  }
}
