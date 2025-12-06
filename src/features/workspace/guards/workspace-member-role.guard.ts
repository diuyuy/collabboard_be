import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RequestWithUser } from 'src/features/auth/types/types';
import { WorkspaceMemberService } from '../workspace-member.service';

@Injectable()
export class WorkspaceMemberRoleGuard implements CanActivate {
  constructor(
    private readonly workspaceMemberService: WorkspaceMemberService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const workspaceId = context.getArgByIndex<string>(0);

    const memberRole =
      await this.workspaceMemberService.getRoleByMemberAndWorkspaceId(
        request.user.id,
        workspaceId,
      );

    return memberRole === 'OWNER' || memberRole === 'ADMIN';
  }
}
