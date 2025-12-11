import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse as ApiResponseDecorator,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiResponse } from 'src/core/api-response/api-response';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { RequestWithUser } from 'src/features/auth/types/types';
import { CreateListDto } from '../list/dto/create-list.dto';
import { ListResponseDto } from '../list/dto/list-response.dto';
import { ListService } from '../list/list.service';
import { BoardService } from './board.service';
import { BoardRole } from './decorators/board-role.decorator';
import { BoardDetailResponseDto } from './dto/board-detail-response.dto';
import { BoardResponseDto } from './dto/board-response.dto';
import { FavoriteBoardResponseDto } from './dto/favorite-board-response.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardAccessGuard } from './guards/board-access.guard';

@ApiTags('Boards')
@ApiExtraModels(
  BoardResponseDto,
  BoardDetailResponseDto,
  FavoriteBoardResponseDto,
  ListResponseDto,
)
@UseGuards(BoardAccessGuard)
@Controller('v1/boards')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly listService: ListService,
  ) {}

  @ApiOperation({ summary: 'Get Board Detail' })
  @ApiParam({ name: 'boardId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'Board detail retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(BoardDetailResponseDto) },
          },
        },
      ],
    },
  })
  @BoardRole(['VIEW'])
  @Get(':boardId')
  async findOne(
    @Param('boardId', ParseUUIDPipe) boardId: string,
  ): Promise<ApiResponse<BoardDetailResponseDto>> {
    const board = await this.boardService.findOne(boardId);

    return ApiResponse.success(board);
  }

  @ApiOperation({ summary: 'Update Board' })
  @ApiParam({ name: 'boardId', type: String })
  @ApiBody({ type: UpdateBoardDto })
  @ApiResponseDecorator({
    status: 200,
    description: 'Board updated successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(BoardResponseDto) },
          },
        },
      ],
    },
  })
  @BoardRole(['MODIFY'])
  @Patch(':boardId')
  async update(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() updateBoardDto: UpdateBoardDto,
  ): Promise<ApiResponse<BoardResponseDto>> {
    const board = await this.boardService.update(boardId, updateBoardDto);

    return ApiResponse.success(board);
  }

  @ApiOperation({ summary: 'Delete Board' })
  @ApiParam({ name: 'boardId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'Board deleted successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'string' },
              },
            },
          },
        },
      ],
    },
  })
  @BoardRole(['MODIFY'])
  @Delete(':boardId')
  async remove(
    @Param('boardId', ParseUUIDPipe) boardId: string,
  ): Promise<ApiResponse<{ id: string }>> {
    const result = await this.boardService.remove(boardId);

    return ApiResponse.success(result);
  }

  @ApiOperation({ summary: 'Add Board to Favorites' })
  @ApiParam({ name: 'boardId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'Board added to favorites successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(FavoriteBoardResponseDto) },
          },
        },
      ],
    },
  })
  @BoardRole(['VIEW'])
  @Post(':boardId/favorites')
  async addFavorite(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<FavoriteBoardResponseDto>> {
    const memberId = req.user.id;
    const result = await this.boardService.addFavorite(boardId, memberId);

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      result,
    );
  }

  @ApiOperation({ summary: 'Remove Board from Favorites' })
  @ApiParam({ name: 'boardId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'Board removed from favorites successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(FavoriteBoardResponseDto) },
          },
        },
      ],
    },
  })
  @BoardRole(['VIEW'])
  @Delete(':boardId/favorites')
  async removeFavorite(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<FavoriteBoardResponseDto>> {
    const memberId = req.user.id;
    const result = await this.boardService.removeFavorite(boardId, memberId);

    return ApiResponse.success(result);
  }

  @ApiOperation({ summary: 'Create List in Board' })
  @ApiParam({ name: 'boardId', type: String })
  @ApiBody({ type: CreateListDto })
  @ApiResponseDecorator({
    status: 201,
    description: 'List created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(ListResponseDto) },
          },
        },
      ],
    },
  })
  @BoardRole(['MODIFY'])
  @Post(':boardId/lists')
  async createList(
    @Param('boardId', ParseUUIDPipe) boardId: string,
    @Body() createListDto: CreateListDto,
  ): Promise<ApiResponse<ListResponseDto>> {
    const listResponseDto = await this.listService.create(
      boardId,
      createListDto,
    );

    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      listResponseDto,
    );
  }
}
