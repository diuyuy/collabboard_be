import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceRole } from 'generated/prisma/enums';

export class InvitationResponseDto {
  @ApiProperty({
    description: 'Unique invitation code',
    example: 'abc123def456',
    type: String,
  })
  inviteCode: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Workspace role assigned to the invitee',
    example: 'MEMBER',
    type: String,
  })
  role: string;

  @ApiProperty({
    description: 'Invitation expiration timestamp',
    example: '2025-12-15T10:00:00.000Z',
    required: false,
    type: Date,
  })
  expiresAt?: Date;

  constructor(data: InvitationResponseDto) {
    this.inviteCode = data.inviteCode;
    this.workspaceId = data.workspaceId;
    this.role = data.role;
    this.expiresAt = data.expiresAt;
  }

  static from(
    inviteCode: string,
    workspaceId: string,
    role: WorkspaceRole,
    expiresAt?: Date,
  ): InvitationResponseDto {
    return new InvitationResponseDto({
      inviteCode,
      workspaceId,
      role,
      expiresAt,
    });
  }
}
