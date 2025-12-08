import { Injectable } from '@nestjs/common';
import { PageResponse } from 'src/core/api-response/page-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { BoardSortOption, Pageable } from 'src/core/types/types';
import { BoardResponseDto } from './dto/board-response.dto';
import { CreateBoardDto } from './dto/create-board.dto';

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
}
