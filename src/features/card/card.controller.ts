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
import { CommentService } from '../comment/comment.service';
import { CommentResponseDto } from '../comment/dto/comment-response.dto';
import { CreateCommentDto } from '../comment/dto/create-comment.dto';
import { CardService } from './card.service';
import { CardRole } from './decorators/card-role.decorator';
import { AddCardAssigneeDto } from './dto/add-card-assignee.dto';
import { AddCardLabelDto } from './dto/add-card-label.dto';
import { CardAssigneeResponseDto } from './dto/card-assignee-response.dto';
import { CardDetailResponseDto } from './dto/card-detail-response.dto';
import { CardLabelResponseDto } from './dto/card-label-response.dto';
import { MoveCardResponseDto } from './dto/move-card-response.dto';
import { MoveCardDto } from './dto/move-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { CardAccessGuard } from './guards/card-access.guard';

@ApiTags('Cards')
@ApiExtraModels(
  CardDetailResponseDto,
  CardAssigneeResponseDto,
  CardLabelResponseDto,
  CommentResponseDto,
  MoveCardResponseDto,
)
@UseGuards(CardAccessGuard)
@Controller('v1/cards')
export class CardController {
  constructor(
    private readonly cardService: CardService,
    private readonly commentService: CommentService,
  ) {}

  @ApiOperation({ summary: 'Get Card Detail' })
  @ApiParam({ name: 'cardId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'Card detail retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(CardDetailResponseDto) },
          },
        },
      ],
    },
  })
  @CardRole(['VIEW'])
  @Get(':cardId')
  async findOne(
    @Param('cardId', ParseUUIDPipe) cardId: string,
  ): Promise<ApiResponse<CardDetailResponseDto>> {
    const card = await this.cardService.findOne(cardId);
    return ApiResponse.success(card);
  }

  @ApiOperation({ summary: 'Update Card' })
  @ApiParam({ name: 'cardId', type: String })
  @ApiBody({ type: UpdateCardDto })
  @ApiResponseDecorator({
    status: 200,
    description: 'Card updated successfully',
    schema: {
      $ref: getSchemaPath(ApiResponse),
    },
  })
  @CardRole(['MODIFY'])
  @Patch(':cardId')
  async update(
    @Param('cardId') cardId: string,
    @Body() updateCardDto: UpdateCardDto,
  ): Promise<ApiResponse<void>> {
    await this.cardService.update(cardId, updateCardDto);
    return ApiResponse.success();
  }

  @ApiOperation({ summary: 'Move Card' })
  @ApiParam({ name: 'cardId', type: String })
  @ApiBody({ type: MoveCardDto })
  @ApiResponseDecorator({
    status: 200,
    description: 'Card moved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              $ref: getSchemaPath(MoveCardResponseDto),
            },
          },
        },
      ],
    },
  })
  @CardRole(['MODIFY'])
  @Patch(':cardId/move')
  async move(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() moveCardDto: MoveCardDto,
  ): Promise<ApiResponse<MoveCardResponseDto>> {
    const result = await this.cardService.move(cardId, moveCardDto);
    return ApiResponse.success(result);
  }

  @ApiOperation({ summary: 'Delete Card' })
  @ApiParam({ name: 'cardId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'Card deleted successfully',
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
  @CardRole(['MODIFY'])
  @Delete(':cardId')
  async remove(
    @Param('cardId', ParseUUIDPipe) cardId: string,
  ): Promise<ApiResponse<{ id: string }>> {
    const result = await this.cardService.remove(cardId);
    return ApiResponse.success(result);
  }

  @ApiOperation({ summary: 'Add Card Assignee' })
  @ApiParam({ name: 'cardId', type: String })
  @ApiBody({ type: AddCardAssigneeDto })
  @ApiResponseDecorator({
    status: 200,
    description: 'Assignee added successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(CardAssigneeResponseDto) },
          },
        },
      ],
    },
  })
  @CardRole(['MODIFY'])
  @Post(':cardId/assignees')
  async addAssignee(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @Body() addCardAssigneeDto: AddCardAssigneeDto,
  ): Promise<ApiResponse<CardAssigneeResponseDto>> {
    const result = await this.cardService.addAssignee(
      cardId,
      addCardAssigneeDto.memberId,
    );
    return ApiResponse.success(result);
  }

  @ApiOperation({ summary: 'Remove Card Assignee' })
  @ApiParam({ name: 'cardId', type: String })
  @ApiParam({ name: 'memberId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'Assignee removed successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'object',
              properties: {
                memberId: { type: 'string' },
              },
            },
          },
        },
      ],
    },
  })
  @CardRole(['MODIFY'])
  @Delete(':cardId/assignees/:memberId')
  async removeAssignee(
    @Param('cardId') cardId: string,
    @Param('memberId') memberId: string,
  ): Promise<ApiResponse<{ memberId: string }>> {
    const result = await this.cardService.removeAssignee(cardId, memberId);
    return ApiResponse.success(result);
  }

  @ApiOperation({ summary: 'Add Label to Card' })
  @ApiParam({ name: 'cardId', type: String })
  @ApiBody({ type: AddCardLabelDto })
  @ApiResponseDecorator({
    status: 201,
    description: 'Label added successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(CardLabelResponseDto) },
          },
        },
      ],
    },
  })
  @CardRole(['MODIFY'])
  @Post(':cardId/labels')
  async addLabel(
    @Param('cardId') cardId: string,
    @Body() addCardLabelDto: AddCardLabelDto,
  ): Promise<ApiResponse<CardLabelResponseDto>> {
    const result = await this.cardService.addLabel(
      cardId,
      addCardLabelDto.labelId,
    );
    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      result,
    );
  }

  @ApiOperation({ summary: 'Remove Label from Card' })
  @ApiParam({ name: 'cardId', type: String })
  @ApiParam({ name: 'labelId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'Label removed successfully',
    schema: {
      $ref: getSchemaPath(ApiResponse),
    },
  })
  @CardRole(['MODIFY'])
  @Delete(':cardId/labels/:labelId')
  async removeLabel(
    @Param('cardId') cardId: string,
    @Param('labelId') labelId: string,
  ): Promise<ApiResponse<void>> {
    await this.cardService.removeLabel(cardId, labelId);
    return ApiResponse.success();
  }

  @ApiOperation({ summary: 'Get Card Comments' })
  @ApiParam({ name: 'cardId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'Comments retrieved successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: {
              type: 'array',
              items: { $ref: getSchemaPath(CommentResponseDto) },
            },
          },
        },
      ],
    },
  })
  @CardRole(['VIEW'])
  @Get(':cardId/comments')
  async getComments(
    @Param('cardId') cardId: string,
  ): Promise<ApiResponse<CommentResponseDto[]>> {
    const comments = await this.commentService.findAllByCard(cardId);
    return ApiResponse.success(comments);
  }

  @ApiOperation({ summary: 'Create Comment on Card' })
  @ApiParam({ name: 'cardId', type: String })
  @ApiBody({ type: CreateCommentDto })
  @ApiResponseDecorator({
    status: 201,
    description: 'Comment created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(CommentResponseDto) },
          },
        },
      ],
    },
  })
  @CardRole(['MODIFY'])
  @Post(':cardId/comments')
  async createComment(
    @Param('cardId') cardId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Req() req: RequestWithUser,
  ): Promise<ApiResponse<CommentResponseDto>> {
    const comment = await this.commentService.create(
      cardId,
      req.user.id,
      createCommentDto,
    );
    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      comment,
    );
  }
}
