import { IsIn } from 'class-validator';
import { WorkspaceRole } from 'generated/prisma/enums';

export class UpdateWorkspaceMemberDto {
  @IsIn([
    WorkspaceRole.OWNER,
    WorkspaceRole.ADMIN,
    WorkspaceRole.MEMBER,
    WorkspaceRole.VIEWER,
  ])
  role: WorkspaceRole;
}
