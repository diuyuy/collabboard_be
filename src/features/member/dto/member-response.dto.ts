import { ApiProperty } from '@nestjs/swagger';
import { Member } from 'generated/prisma/client';
import { MemberRole } from 'generated/prisma/enums';

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
    enum: MemberRole,
    example: MemberRole.USER,
  })
  role: MemberRole;

  @ApiProperty({
    description: 'Member nickname',
    example: 'User1', // Note: Keeping the example as is, assuming it might be non-English
    nullable: true,
  })
  nickname: string | null;

  @ApiProperty({
    description: 'Member profile image url',
    example: 'http://', // Note: Keeping the example as is, assuming it might be non-English
    nullable: true,
  })
  imageUrl: string | null;

  constructor({ id, email, role, nickname, imageUrl }: MemberResponseDto) {
    this.id = id;
    this.email = email;
    this.role = role;
    this.nickname = nickname;
    this.imageUrl = imageUrl;
  }

  static from(member: Member): MemberResponseDto {
    return new MemberResponseDto(member);
  }
}
