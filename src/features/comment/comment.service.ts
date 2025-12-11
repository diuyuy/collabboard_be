import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async findAllByCard(cardId: string): Promise<CommentResponseDto[]> {
    const comments = await this.prismaService.comment.findMany({
      where: {
        cardId,
        Member: {
          isNot: null,
        },
      },
      include: {
        Member: {
          select: {
            id: true,
            email: true,
            nickname: true,
            imageUrl: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return comments.map(CommentResponseDto.from);
  }

  async create(
    cardId: string,
    memberId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    // Validate card exists
    const card = await this.prismaService.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.CARD_NOT_FOUND),
      );
    }

    // Create comment
    const comment = await this.prismaService.comment.create({
      data: {
        content: createCommentDto.content,
        cardId,
        memberId,
      },
      include: {
        Member: {
          select: {
            id: true,
            email: true,
            nickname: true,
            imageUrl: true,
          },
        },
      },
    });

    return CommentResponseDto.from(comment);
  }

  async update(
    commentId: string,
    updateCommentDto: UpdateCommentDto,
  ): Promise<CommentResponseDto> {
    // Update comment
    const updatedComment = await this.prismaService.comment.update({
      where: { id: commentId },
      data: {
        content: updateCommentDto.content,
      },
      include: {
        Member: {
          select: {
            id: true,
            email: true,
            nickname: true,
            imageUrl: true,
          },
        },
      },
    });

    return CommentResponseDto.from(updatedComment);
  }

  async delete(commentId: string): Promise<void> {
    // Hard delete comment
    await this.prismaService.comment.delete({
      where: { id: commentId },
    });
  }

  async validateModifyCommentAuthority(
    memberId: string,
    commentId: string,
  ): Promise<void> {
    const comment = await this.prismaService.comment.findUnique({
      select: {
        memberId: true,
      },
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.COMMENT_NOT_FOUND),
      );
    }

    if (memberId !== comment.memberId)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.MODIFY_COMMENT_DENIED),
      );
  }
}
