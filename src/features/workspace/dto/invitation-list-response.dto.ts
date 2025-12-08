import { ApiProperty } from '@nestjs/swagger';
import { InvitationListFromPrisma } from '../types/types';

export class InvitationListItemDto {
  @ApiProperty({
    description: 'Invitation ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  workspaceId: string;

  @ApiProperty({
    description: 'Workspace name',
    example: 'My Workspace',
    type: String,
  })
  workspaceName: string;

  @ApiProperty({
    description: 'Email of the inviter',
    example: 'inviter@example.com',
    type: String,
  })
  inviterEmail: string;

  @ApiProperty({
    description: 'Nickname of the inviter',
    example: 'John Doe',
    nullable: true,
    type: String,
  })
  inviterNickname: string | null;

  @ApiProperty({
    description: 'Workspace role assigned in the invitation',
    example: 'MEMBER',
    type: String,
  })
  role: string;

  @ApiProperty({
    description: 'Invitation status',
    example: 'PENDING',
    type: String,
  })
  status: string;

  @ApiProperty({
    description: 'Invitation creation timestamp',
    example: '2025-12-08T10:00:00.000Z',
    type: Date,
  })
  createdAt: Date;

  constructor({
    id,
    workspaceId,
    workspaceName,
    inviterEmail,
    inviterNickname,
    role,
    status,
    createdAt,
  }: InvitationListItemDto) {
    this.id = id;
    this.workspaceId = workspaceId;
    this.workspaceName = workspaceName;
    this.inviterEmail = inviterEmail;
    this.inviterNickname = inviterNickname;
    this.role = role;
    this.status = status;
    this.createdAt = createdAt;
  }

  static from(
    this: void,
    { Member, Workspace, ...props }: InvitationListFromPrisma,
  ): InvitationListItemDto {
    return new InvitationListItemDto({
      ...props,
      workspaceName: Workspace.name,
      inviterEmail: Member.email,
      inviterNickname: Member.nickname,
    });
  }
}
