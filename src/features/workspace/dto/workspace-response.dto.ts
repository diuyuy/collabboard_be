import { Workspace } from 'generated/prisma/client';

export class WorkspaceResponseDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
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
