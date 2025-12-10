import { Injectable } from '@nestjs/common';
import {
  ResponseCode,
  ResponseStatusFactory,
} from 'src/core/api-response/response-status';
import { CommonHttpException } from 'src/core/exception/common-http-exception';
import { PrismaService } from 'src/core/infrastructure/prisma-module/prisma.service';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

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
}
