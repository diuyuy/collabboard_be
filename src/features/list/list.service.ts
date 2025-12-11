import { Injectable } from '@nestjs/common';
import { WorkspaceRole } from 'generated/prisma/enums';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { CreateListDto } from './dto/create-list.dto';
import { ListResponseDto } from './dto/list-response.dto';
import { UpdateListDto } from './dto/update-list.dto';

@Injectable()
export class ListService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    boardId: string,
    createListDto: CreateListDto,
  ): Promise<ListResponseDto> {
    const list = await this.prismaService.list.create({
      data: {
        ...createListDto,
        boardId,
      },
    });

    return ListResponseDto.from(list);
  }

  async update(
    listId: string,
    updateListDto: UpdateListDto,
  ): Promise<ListResponseDto> {
    // Validate list exists
    const list = await this.prismaService.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.LIST_NOT_FOUND),
      );
    }

    // Update list
    const updatedList = await this.prismaService.list.update({
      where: { id: listId },
      data: updateListDto,
    });

    return ListResponseDto.from(updatedList);
  }

  async updatePosition(
    listId: string,
    position: string,
  ): Promise<ListResponseDto> {
    // Validate list exists
    const list = await this.prismaService.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.LIST_NOT_FOUND),
      );
    }

    // Update position
    const updatedList = await this.prismaService.list.update({
      where: { id: listId },
      data: { position },
    });

    return ListResponseDto.from(updatedList);
  }

  async remove(listId: string): Promise<{ id: string }> {
    // Validate list exists
    const list = await this.prismaService.list.findUnique({
      where: { id: listId },
    });

    if (!list) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.LIST_NOT_FOUND),
      );
    }

    // Delete list (cards will be cascade deleted)
    await this.prismaService.list.delete({
      where: { id: listId },
    });

    return { id: listId };
  }

  async getBoardIdFromList(listId: string): Promise<string> {
    const list = await this.prismaService.list.findUnique({
      where: { id: listId },
      select: { boardId: true },
    });

    if (!list) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.LIST_NOT_FOUND),
      );
    }

    return list.boardId;
  }

  async validateAccessListAuthority(
    memberId: string,
    listId: string,
  ): Promise<void> {
    await this.getWorkspaceMemberRole(memberId, listId);
  }

  async validateModifyListAuthority(
    memberId: string,
    listId: string,
  ): Promise<void> {
    const workspaceMember = await this.getWorkspaceMemberRole(memberId, listId);

    if (workspaceMember.role === 'VIEWER')
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MODIFY_LIST_DENIED),
      );
  }

  private async getWorkspaceMemberRole(
    memberId: string,
    listId: string,
  ): Promise<{ role: WorkspaceRole }> {
    const list = await this.prismaService.list.findUnique({
      select: {
        Board: {
          select: {
            Workspace: {
              select: {
                WorkspaceMember: {
                  select: {
                    role: true,
                  },
                  where: {
                    memberId,
                  },
                },
              },
            },
          },
        },
      },
      where: {
        id: listId,
      },
    });

    if (!list)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.LIST_NOT_FOUND),
      );

    const workspaceMember = list.Board.Workspace.WorkspaceMember.at(0);

    if (!workspaceMember)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.ACCESS_LIST_DENIED),
      );

    return workspaceMember;
  }
}
