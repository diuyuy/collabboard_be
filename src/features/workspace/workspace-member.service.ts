import { Injectable } from '@nestjs/common';
import { WorkspaceRole } from 'generated/prisma/enums';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { AddWorkspaceMemberDto } from './dto/add-workspace-member.dto';
import { WorkspaceMemberResponseDto } from './dto/workspace-member-response.dto';

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

  async findAllMembers(
    workspaceId: string,
  ): Promise<WorkspaceMemberResponseDto[]> {
    const workspaceMembers = await this.prismaService.workspaceMember.findMany({
      where: {
        workspaceId,
      },
      include: {
        Member: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        joinAt: 'asc',
      },
    });

    return workspaceMembers.map((wm) =>
      WorkspaceMemberResponseDto.from(
        wm.Member.id,
        wm.Member.nickname,
        wm.role,
        wm.joinAt,
      ),
    );
  }

  async updateWorkspaceMemberRole(
    workspaceId: string,
    memberId: string,
    role: WorkspaceRole,
  ): Promise<WorkspaceMemberResponseDto> {
    // Check if member exists in workspace
    const existingMember = await this.prismaService.workspaceMember.findUnique({
      where: {
        workspaceId_memberId: {
          workspaceId,
          memberId,
        },
      },
      include: {
        Member: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    if (!existingMember) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MEMBER_NOT_FOUND),
      );
    }

    const updatedMember = await this.prismaService.workspaceMember.update({
      data: {
        role,
      },
      where: {
        workspaceId_memberId: {
          workspaceId,
          memberId,
        },
      },
      include: {
        Member: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return WorkspaceMemberResponseDto.from(
      updatedMember.Member.id,
      updatedMember.Member.nickname,
      updatedMember.role,
      updatedMember.joinAt,
    );
  }

  async removeWorkspaceMember(
    workspaceId: string,
    memberId: string,
  ): Promise<void> {
    // Check if member exists in workspace
    const existingMember = await this.prismaService.workspaceMember.findUnique({
      where: {
        workspaceId_memberId: {
          workspaceId,
          memberId,
        },
      },
    });

    if (!existingMember) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MEMBER_NOT_FOUND),
      );
    }

    await this.prismaService.workspaceMember.delete({
      where: {
        workspaceId_memberId: {
          workspaceId,
          memberId,
        },
      },
    });
  }

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
