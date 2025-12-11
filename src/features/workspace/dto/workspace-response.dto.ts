import { ApiProperty } from '@nestjs/swagger';
import { Workspace } from 'generated/prisma/client';

export class WorkspaceResponseDto {
  @ApiProperty({
    description: 'Workspace ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Workspace name',
    example: 'My Workspace',
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'Workspace description',
    example: 'A workspace for team collaboration',
    nullable: true,
    type: String,
  })
  description: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-08T10:00:00.000Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-12-08T10:00:00.000Z',
    type: Date,
  })
  updatedAt: Date;

  constructor({
    id,
    name,
    description,
    createdAt,
    updatedAt,
  }: WorkspaceResponseDto) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static from(this: void, workspace: Workspace): WorkspaceResponseDto {
    return new WorkspaceResponseDto(workspace);
  }
}
