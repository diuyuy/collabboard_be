import { Injectable } from '@nestjs/common';
import { WorkspaceRole } from 'generated/prisma/enums';
import { PageResponse } from 'src/core/api-response/page-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { BoardSortOption, Pageable } from 'src/core/types/types';
import { BoardDetailResponseDto } from './dto/board-detail-response.dto';
import { BoardResponseDto } from './dto/board-response.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { FavoriteBoardResponseDto } from './dto/favorite-board-response.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

// Build where clause
type WhereClause = {
  workspaceId: string;
  FavoriteBoard?:
    | { some: { memberId: string } }
    | { none: { memberId: string } };
};

@Injectable()
export class BoardService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(
    workspaceId: string,
    memberId: string,
    pageable: Pageable<BoardSortOption>,
    isFavorite?: boolean,
  ): Promise<PageResponse<BoardResponseDto>> {
    const where: WhereClause = {
      workspaceId,
    };

    // Add favorite filter if specified
    if (isFavorite !== undefined) {
      if (isFavorite) {
        where.FavoriteBoard = {
          some: {
            memberId,
          },
        };
      } else {
        where.FavoriteBoard = {
          none: {
            memberId,
          },
        };
      }
    }

    const [boards, totalElements] = await Promise.all([
      this.prismaService.board.findMany({
        where,
        skip: pageable.page * pageable.size,
        take: pageable.size,
        orderBy: {
          [pageable.sortProp]: pageable.sortDirection,
        },
        include: {
          List: {
            select: {
              id: true,
              _count: {
                select: {
                  Card: true,
                },
              },
            },
          },
          FavoriteBoard: {
            where: {
              memberId,
            },
            select: {
              id: true,
            },
          },
        },
      }),
      this.prismaService.board.count({ where }),
    ]);

    // Calculate list and card counts, and check if favorite
    const items = boards.map((board) => {
      const listCount = board.List.length;
      const cardCount = board.List.reduce(
        (sum, list) => sum + list._count.Card,
        0,
      );
      const isBoardFavorite = board.FavoriteBoard.length > 0;

      return BoardResponseDto.from(
        board,
        isBoardFavorite,
        listCount,
        cardCount,
      );
    });

    return PageResponse.from(items, totalElements, pageable);
  }

  async create(
    workspaceId: string,
    memberId: string,
    createBoardDto: CreateBoardDto,
  ): Promise<BoardResponseDto> {
    // Validate workspace exists
    const workspace = await this.prismaService.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.WORKSPACE_NOT_FOUND),
      );
    }

    // Create board
    const board = await this.prismaService.board.create({
      data: {
        ...createBoardDto,
        workspaceId,
        ownerId: memberId,
      },
    });

    return BoardResponseDto.from(board, false, 0, 0);
  }

  async findOne(boardId: string): Promise<BoardDetailResponseDto> {
    const board = await this.prismaService.board.findUnique({
      where: { id: boardId },
      include: {
        List: {
          orderBy: { position: 'asc' },
          include: {
            Card: {
              orderBy: { position: 'asc' },
              include: {
                CardAssignee: {
                  include: {
                    Member: {
                      select: {
                        id: true,
                        nickname: true,
                      },
                    },
                  },
                },
                CardLabel: {
                  include: {
                    Label: {
                      select: {
                        id: true,
                        title: true,
                        color: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    Comment: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!board) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.BOARD_NOT_FOUND),
      );
    }

    return BoardDetailResponseDto.from(board);
  }

  async update(
    boardId: string,
    updateBoardDto: UpdateBoardDto,
  ): Promise<BoardResponseDto> {
    // Validate board exists and user has access
    const board = await this.prismaService.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.BOARD_NOT_FOUND),
      );
    }

    // Update board
    const updatedBoard = await this.prismaService.board.update({
      where: { id: boardId },
      data: updateBoardDto,
    });

    return BoardResponseDto.from(updatedBoard);
  }

  async remove(boardId: string): Promise<{ id: string }> {
    // Validate board exists
    const board = await this.prismaService.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.BOARD_NOT_FOUND),
      );
    }

    // Delete board
    await this.prismaService.board.delete({
      where: { id: boardId },
    });

    return { id: boardId };
  }

  async addFavorite(
    boardId: string,
    memberId: string,
  ): Promise<FavoriteBoardResponseDto> {
    // Validate board exists
    const board = await this.prismaService.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.BOARD_NOT_FOUND),
      );
    }

    await this.prismaService.favoriteBoard.upsert({
      create: {
        memberId,
        boardId,
      },
      update: {},
      where: {
        memberId_boardId: {
          memberId,
          boardId,
        },
      },
    });

    return FavoriteBoardResponseDto.from(boardId, true);
  }

  async removeFavorite(
    boardId: string,
    memberId: string,
  ): Promise<FavoriteBoardResponseDto> {
    // Validate board exists
    const board = await this.prismaService.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.BOARD_NOT_FOUND),
      );
    }

    // Delete favorite if exists
    await this.prismaService.favoriteBoard.delete({
      where: {
        memberId_boardId: {
          memberId,
          boardId,
        },
      },
    });

    return FavoriteBoardResponseDto.from(boardId, false);
  }

  async validateAccessBoardAuthority(
    memberId: string,
    boardId: string,
  ): Promise<void> {
    await this.getBoardMember(memberId, boardId);
  }

  async validateModifyBoardAuthority(
    memberId: string,
    boardId: string,
  ): Promise<void> {
    const workspaceMember = await this.getBoardMember(memberId, boardId);

    if (workspaceMember.role === 'VIEWER')
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MODIFY_BOARD_DENIED),
      );
  }

  private async getBoardMember(
    memberId: string,
    boardId: string,
  ): Promise<{ role: WorkspaceRole }> {
    const board = await this.prismaService.board.findUnique({
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
      where: {
        id: boardId,
      },
    });

    if (!board) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.BOARD_NOT_FOUND),
      );
    }

    const workspaceMember = board.Workspace.WorkspaceMember.at(0);

    if (!workspaceMember)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.ACCESS_BOARD_DENIED),
      );

    return workspaceMember;
  }
}
