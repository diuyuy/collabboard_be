import { IsIn, IsString } from 'class-validator';
import { WorkspaceMember_role } from 'generated/prisma/enums';

export class CreateWorkspaceMemberDto {
  @IsString()
  workspaceId: string;

  @IsString()
  memberId: string;

  @IsIn([
    WorkspaceMember_role.OWNER,
    WorkspaceMember_role.ADMIN,
    WorkspaceMember_role.MEMBER,
    WorkspaceMember_role.VIEWER,
  ])
  role: WorkspaceMember_role;
}
