import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiResponse as ApiResponseDecorator,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApiResponse } from 'src/core/api-response/api-response';
import { CommentService } from './comment.service';
import { CommentResponseDto } from './dto/comment-response.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentAccessGuard } from './guards/comment-access.guard';

@ApiTags('Comments')
@ApiExtraModels(CommentResponseDto)
@UseGuards(CommentAccessGuard)
@Controller('v1/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @ApiOperation({ summary: 'Update Comment' })
  @ApiParam({ name: 'commentId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'Comment updated successfully',
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
  @Patch(':commentId')
  async update(
    @Param('commentId') commentId: string,
    @Body() updateCommentDto: UpdateCommentDto,
  ): Promise<ApiResponse<CommentResponseDto>> {
    const comment = await this.commentService.update(
      commentId,
      updateCommentDto,
    );
    return ApiResponse.success(comment);
  }

  @ApiOperation({ summary: 'Delete Comment' })
  @ApiParam({ name: 'commentId', type: String })
  @ApiResponseDecorator({
    status: 200,
    description: 'Comment deleted successfully',
    schema: {
      $ref: getSchemaPath(ApiResponse),
    },
  })
  @Delete(':commentId')
  async delete(
    @Param('commentId') commentId: string,
  ): Promise<ApiResponse<void>> {
    await this.commentService.delete(commentId);
    return ApiResponse.success();
  }
}
