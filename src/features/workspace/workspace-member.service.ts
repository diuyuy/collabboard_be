import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { AddWorkspaceMemberDto } from './dto/add-workspace-member.dto';
import { WorkspaceService } from './workspace.service';

@Injectable()
export class WorkspaceMemberService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  async addMembers(
    memberId: string,
    workspaceId: string,
    { members }: AddWorkspaceMemberDto,
  ): Promise<void> {
    await this.workspaceService.validateWorkspaceAccess(memberId, workspaceId);

    await this.prismaService.workspaceMember.createMany({
      data: members.map(({ memberId, role, workspaceId }) => ({
        memberId,
        role,
        workspaceId,
      })),
    });
  }
}
