import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  Post,
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
import { CardService } from '../card/card.service';
import { CardResponseDto } from '../card/dto/card-response.dto';
import { CreateCardDto } from '../card/dto/create-card.dto';
import { ListRole } from './decorators/list-role.decorator';
import { ListResponseDto } from './dto/list-response.dto';
import { UpdateListPositionDto } from './dto/update-list-position.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { ListAccessGuard } from './guards/list-access.guard';
import { ListService } from './list.service';

@ApiTags('Lists')
@ApiExtraModels(ListResponseDto, CardResponseDto)
@UseGuards(ListAccessGuard)
@Controller('v1/lists')
export class ListController {
  constructor(
    private readonly listService: ListService,
    private readonly cardService: CardService,
  ) {}

  @ApiOperation({ summary: 'Update List' })
  @ApiParam({ name: 'listId', type: String })
  @ApiBody({ type: UpdateListDto })
  @ApiResponseDecorator({
    status: 200,
    description: 'List updated successfully',
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
  @ListRole(['MODIFY'])
  @Patch(':listId')
  async update(
    @Param('listId') listId: string,
    @Body() updateListDto: UpdateListDto,
  ): Promise<ApiResponse<ListResponseDto>> {
    const list = await this.listService.update(listId, updateListDto);
    return ApiResponse.success(list);
  }

  @ApiOperation({ summary: 'Update List Position' })
  @ApiParam({ name: 'listId', type: String })
  @ApiBody({ type: UpdateListPositionDto })
  @ApiResponseDecorator({
    status: 200,
    description: 'List position updated successfully',
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
  @ListRole(['MODIFY'])
  @Patch(':listId/position')
  async updatePosition(
    @Param('listId') listId: string,
    @Body() updateListPositionDto: UpdateListPositionDto,
  ): Promise<ApiResponse<ListResponseDto>> {
    const list = await this.listService.updatePosition(
      listId,
      updateListPositionDto.position,
    );
    return ApiResponse.success(list);
  }

  @ApiOperation({ summary: 'Delete List' })
  @ApiParam({ name: 'listId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'List deleted successfully',
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
  @ListRole(['MODIFY'])
  @Delete(':listId')
  async remove(
    @Param('listId') listId: string,
  ): Promise<ApiResponse<{ id: string }>> {
    const result = await this.listService.remove(listId);
    return ApiResponse.success(result);
  }

  @ApiOperation({ summary: 'Create Card in List' })
  @ApiParam({ name: 'listId', type: String })
  @ApiBody({ type: CreateCardDto })
  @ApiResponseDecorator({
    status: 201,
    description: 'Card created successfully',
    schema: {
      allOf: [
        { $ref: getSchemaPath(ApiResponse) },
        {
          properties: {
            data: { $ref: getSchemaPath(CardResponseDto) },
          },
        },
      ],
    },
  })
  @ListRole(['MODIFY'])
  @Post(':listId/cards')
  async createCard(
    @Param('listId') listId: string,
    @Body() createCardDto: CreateCardDto,
  ): Promise<ApiResponse<CardResponseDto>> {
    const card = await this.cardService.create(listId, createCardDto);
    return ApiResponse.from(
      ResponseStatusFactory.create(ResponseCode.CREATED),
      card,
    );
  }
}
