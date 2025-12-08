import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { WorkspaceRole } from 'generated/prisma/enums';

export class InviteeDto {
  @ApiProperty({
    description: 'Email address of the invitee',
    example: 'user@example.com',
    type: String,
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Workspace role for the invitee',
    enum: WorkspaceRole,
    example: WorkspaceRole.MEMBER,
  })
  @IsEnum(WorkspaceRole)
  @IsNotEmpty()
  role: WorkspaceRole;
}

export class CreateInvitationDto {
  @ApiProperty({
    description: 'List of invitees to invite to the workspace',
    type: [InviteeDto],
    example: [
      { email: 'user1@example.com', role: 'MEMBER' },
      { email: 'user2@example.com', role: 'ADMIN' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InviteeDto)
  @IsNotEmpty()
  invitees: InviteeDto[];
}
