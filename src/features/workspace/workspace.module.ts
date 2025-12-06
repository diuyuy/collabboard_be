import { Module } from '@nestjs/common';
import { WorkspaceMemberRoleGuard } from './guards/workspace-member-role.guard';
import { WorkspaceMemberService } from './workspace-member.service';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

@Module({
  controllers: [WorkspaceController],
  providers: [
    WorkspaceService,
    WorkspaceMemberService,
    WorkspaceMemberRoleGuard,
  ],
})
export class WorkspaceModule {}
