import { ApiProperty } from '@nestjs/swagger';

export class CommentMemberDto {
  @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'john@example.com' })
  email: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  nickname: string | null;

  @ApiProperty({ example: 'https://example.com/avatar1.jpg', nullable: true })
  imageUrl: string | null;
}

export class CommentResponseDto {
  @ApiProperty({ example: 'bb0e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({
    example: '작업 시작했습니다. JWT 라이브러리 설치 완료했어요.',
  })
  content: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  cardId: string;

  @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440000' })
  memberId: string;

  @ApiProperty({ example: '2025-12-10T14:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-10T14:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ type: CommentMemberDto })
  member: CommentMemberDto;

  static from(
    this: void,
    comment: {
      Member: {
        id: string;
        email: string;
        nickname: string | null;
        imageUrl: string | null;
      } | null;
    } & {
      id: string;
      content: string;
      cardId: string | null;
      memberId: string | null;
      createdAt: Date;
      updatedAt: Date;
    },
  ): CommentResponseDto {
    return {
      id: comment.id,
      content: comment.content,
      cardId: comment.cardId ?? '', // Prisma 타입 추론의 한계
      memberId: comment.memberId ?? '',
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      member: {
        id: comment.Member?.id ?? '',
        email: comment.Member?.email ?? '',
        nickname: comment.Member?.nickname ?? '',
        imageUrl: comment.Member?.imageUrl ?? '',
      },
    };
  }
}
