import { Module } from '@nestjs/common';
import { BoardModule } from '../board/board.module';
import { WorkspaceMemberRoleGuard } from './guards/workspace-member-role.guard';
import { InvitationService } from './invitation.service';
import { WorkspaceMemberService } from './workspace-member.service';
import { WorkspaceController } from './workspace.controller';
import { WorkspaceService } from './workspace.service';

@Module({
  imports: [BoardModule],
  controllers: [WorkspaceController],
  providers: [
    WorkspaceService,
    WorkspaceMemberService,
    InvitationService,
    WorkspaceMemberRoleGuard,
  ],
})
export class WorkspaceModule {}
