import { Injectable } from '@nestjs/common';
import { WorkspaceRole } from 'generated/prisma/enums';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { AddWorkspaceMemberDto } from './dto/add-workspace-member.dto';
import { UpdateWorkspaceMemberDto } from './dto/update-workspace-member.dto';

@Injectable()
export class WorkspaceMemberService {
  constructor(private readonly prismaService: PrismaService) {}

  async addMembers(
    workspaceId: string,
    { members }: AddWorkspaceMemberDto,
  ): Promise<void> {
    await this.prismaService.workspaceMember.createMany({
      data: members.map(({ memberId, role }) => ({
        memberId,
        role,
        workspaceId,
      })),
    });
  }

  async updateWorkspaceMemberRole(
    workspaceId: string,
    updateWorkspaceMemberDto: UpdateWorkspaceMemberDto,
  ): Promise<void> {
    await this.prismaService.workspaceMember.update({
      data: {
        role: updateWorkspaceMemberDto.role,
      },
      where: {
        workspaceId_memberId: {
          workspaceId,
          memberId: updateWorkspaceMemberDto.memberId,
        },
      },
    });
  }

  async removeWorkspaceMember() {}

  async getRoleByMemberAndWorkspaceId(
    memberId: string,
    workspaceId: string,
  ): Promise<WorkspaceRole | null> {
    const workspaceMember = await this.prismaService.workspaceMember.findUnique(
      {
        select: {
          role: true,
        },
        where: {
          workspaceId_memberId: {
            memberId,
            workspaceId,
          },
        },
      },
    );

    return workspaceMember?.role ?? null;
  }
}
