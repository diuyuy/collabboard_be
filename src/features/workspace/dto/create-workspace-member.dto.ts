import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { WorkspaceRole } from 'generated/prisma/enums';

export class CreateWorkspaceMemberDto {
  @IsString()
  @IsNotEmpty()
  memberId: string;

  @IsIn([
    WorkspaceRole.OWNER,
    WorkspaceRole.ADMIN,
    WorkspaceRole.MEMBER,
    WorkspaceRole.VIEWER,
  ])
  role: WorkspaceRole;
}
