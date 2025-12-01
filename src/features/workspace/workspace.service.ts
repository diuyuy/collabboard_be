import { Injectable } from '@nestjs/common';
import { Workspace } from 'generated/prisma/client';
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
import { WorkspaceResponseDto } from './dto/workspace-response.dto';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    memberId: string,
    createWorkspaceDto: CreateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    const newWorkspace = await this.prismaService.workspace.create({
      data: {
        ...createWorkspaceDto,
        ownerId: memberId,
      },
    });

    return WorkspaceResponseDto.from(newWorkspace);
  }

  async findAll(
    memberId: string,
    pageable: Pageable<WorkspaceSortOption>,
  ): Promise<PageResponse<WorkspaceResponseDto>> {
    const [workspaces, totalElements] = await Promise.all([
      this.prismaService.workspace.findMany({
        where: {
          ownerId: memberId,
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
    const workspace = await this.validateWorkspaceAccess(workspaceId, memberId);

    return WorkspaceResponseDto.from(workspace);
  }

  async update(
    memberId: string,
    workspaceId: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
  ): Promise<WorkspaceResponseDto> {
    await this.validateWorkspaceAccess(workspaceId, memberId);

    const workspace = await this.prismaService.workspace.update({
      data: updateWorkspaceDto,
      where: {
        id: workspaceId,
      },
    });

    return WorkspaceResponseDto.from(workspace);
  }

  async remove(memberId: string, workspaceId: string): Promise<void> {
    await this.validateWorkspaceAccess(workspaceId, memberId);
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
