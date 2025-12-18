import { Injectable } from '@nestjs/common';
import { Workspace, WorkspaceRole } from 'generated/prisma/client';
import { PageResponse } from 'src/core/api-response/page-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { Pageable, WorkspaceSortOption } from 'src/core/types/types';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceBriefResponseDto } from './dto/workspace-brief-response.dto';
import { WorkspaceResponseDto } from './dto/workspace-response.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    memberId: string,
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<WorkspaceBriefResponseDto> {
    const existingWorkspace = await this.prismaService.workspace.findUnique({
      select: {
        id: true,
      },
      where: {
        ownerId_name: {
          ownerId: memberId,
          name: createWorkspaceDto.name,
        },
      },
    });

    if (existingWorkspace)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.WORKSPACE_ALREADY_EXSITS),
      );

    const newWorkspace = await this.prismaService.workspace.create({
      data: {
        ...createWorkspaceDto,
        ownerId: memberId,
        WorkspaceMember: {
          create: {
            memberId,
            role: WorkspaceRole.OWNER,
          },
        },
      },
    });

    return WorkspaceBriefResponseDto.from(newWorkspace);
  }

  async findAll(
    memberId: string,
    pageable: Pageable<WorkspaceSortOption>,
  ): Promise<PageResponse<WorkspaceResponseDto>> {
    const [workspaces, totalElements] = await Promise.all([
      this.prismaService.workspace.findMany({
        include: {
          _count: {
            select: {
              WorkspaceMember: true,
            },
          },
          WorkspaceMember: {
            select: {
              role: true,
            },
            where: {
              memberId,
            },
          },
        },
        where: {
          WorkspaceMember: {
            some: {
              memberId,
            },
          },
        },
        skip: pageable.page * pageable.size,
        take: pageable.size,
        orderBy: {
          [pageable.sortProp]: pageable.sortDirection,
        },
      }),
      this.prismaService.workspace.count({
        where: {
          ownerId: memberId,
        },
      }),
    ]);

    const items = workspaces.map(WorkspaceResponseDto.from);

    return PageResponse.from(items, totalElements, pageable);
  }

  async findOne(
    memberId: string,
    workspaceId: string,
  ): Promise<WorkspaceResponseDto> {
    await this.validateWorkspaceAccess(memberId, workspaceId);

    const workspace = await this.prismaService.workspace.findUnique({
      where: {
        id: workspaceId,
      },
      include: {
        _count: {
          select: {
            WorkspaceMember: true,
          },
        },
        WorkspaceMember: {
          select: {
            role: true,
          },
          where: {
            memberId,
          },
        },
      },
    });

    if (!workspace) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.WORKSPACE_NOT_FOUND),
      );
    }

    return WorkspaceResponseDto.from(workspace);
  }

  async update(
    memberId: string,
    workspaceId: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<WorkspaceBriefResponseDto> {
    await this.validateWorkspaceAccess(memberId, workspaceId);

    const workspace = await this.prismaService.workspace.update({
      data: updateWorkspaceDto,
      where: {
        id: workspaceId,
      },
    });

    return WorkspaceBriefResponseDto.from(workspace);
  }

  async remove(memberId: string, workspaceId: string): Promise<void> {
    await this.validateWorkspaceAccess(memberId, workspaceId);
    await this.prismaService.workspace.delete({
      where: {
        id: workspaceId,
      },
    });
  }

  async validateWorkspaceAccess(
    memberId: string,
    workspaceId: string,
  ): Promise<Workspace> {
    const workspace = await this.prismaService.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });

    if (!workspace)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.WORKSPACE_NOT_FOUND),
      );

    if (workspace.ownerId !== memberId)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.WORKSPACE_ACCESS_DENIED),
      );

    return workspace;
  }
}
