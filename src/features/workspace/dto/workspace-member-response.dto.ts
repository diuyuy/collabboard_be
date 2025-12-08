import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceRole } from 'generated/prisma/enums';

export class WorkspaceMemberResponseDto {
  @ApiProperty({
    description: 'Member information',
    example: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      nickname: 'John Doe',
    },
    type: Object,
  })
  member: {
    id: string;
    nickname: string | null;
  };

  @ApiProperty({
    description: 'Workspace role of the member',
    enum: WorkspaceRole,
    example: WorkspaceRole.MEMBER,
  })
  role: WorkspaceRole;

  @ApiProperty({
    description: 'Timestamp when the member joined the workspace',
    example: '2025-12-08T10:00:00.000Z',
    type: Date,
  })
  joinAt: Date;

  constructor(data: WorkspaceMemberResponseDto) {
    this.member = data.member;
    this.role = data.role;
    this.joinAt = data.joinAt;
  }

  static from(
    memberId: string,
    nickname: string | null,
    role: WorkspaceRole,
    joinAt: Date,
  ): WorkspaceMemberResponseDto {
    return new WorkspaceMemberResponseDto({
      member: {
        id: memberId,
        nickname,
      },
      role,
      joinAt,
    });
  }
}
