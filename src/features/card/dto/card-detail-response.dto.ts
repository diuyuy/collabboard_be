import { ApiProperty } from '@nestjs/swagger';
import { CardPriority, CardStatus } from 'generated/prisma/client';
import { CardDetailFromPrisma } from '../types/types';

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

export class CardCommentDto {
  @ApiProperty({ example: 'bb0e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({
    example: '작업 시작했습니다. JWT 라이브러리 설치 완료했어요.',
  })
  content: string;

  @ApiProperty({ example: '2025-12-10T14:00:00Z' })
  createdAt: Date;

  @ApiProperty({ example: '2025-12-10T14:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ type: CommentMemberDto })
  member: CommentMemberDto;
}

export class CardAssigneeDetailDto {
  @ApiProperty({
    example: {
      id: 'member-uuid-1111',
      nickname: 'FrontendMaster',
      profileImage: 'https://k.kakaocdn.net/...',
    },
  })
  member: {
    id: string;
    nickname: string | null;
    profileImage: string | null;
  };
}

export class CardLabelDetailDto {
  @ApiProperty({
    example: {
      id: 'label-uuid-3333',
      title: 'Frontend',
    },
  })
  label: {
    id: string;
    title: string;
  };
}

export class CardDetailResponseDto {
  @ApiProperty({ example: 'card-uuid-1234-5678' })
  id: string;

  @ApiProperty({ example: '로그인 페이지 퍼블리싱' })
  title: string;

  @ApiProperty({
    example: '## 구현 상세\n- 소셜 로그인 버튼 위치 조정\n- 반응형 처리',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: 'list-uuid-9999-8888' })
  listId: string | null;

  @ApiProperty({ example: '0|hzi:00001' })
  position: string;

  @ApiProperty({ enum: CardPriority, example: CardPriority.HIGH })
  priority: CardPriority;

  @ApiProperty({ enum: CardStatus, example: CardStatus.IN_PROGRESS })
  status: CardStatus;

  @ApiProperty({ example: '2024-05-21T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-05-22T14:30:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [CardAssigneeDetailDto] })
  cardAssignees: CardAssigneeDetailDto[];

  @ApiProperty({ type: [CardLabelDetailDto] })
  cardLabels: CardLabelDetailDto[];

  @ApiProperty({ type: [CardCommentDto] })
  comments: CardCommentDto[];

  static from(card: CardDetailFromPrisma): CardDetailResponseDto {
    return {
      id: card.id,
      title: card.title,
      description: card.description,
      listId: card.listId,
      position: card.position,
      priority: card.priority,
      status: card.status,
      createdAt: card.createdAt,
      updatedAt: card.updatedAt,
      cardAssignees: card.CardAssignee.map((assignee) => ({
        member: {
          id: assignee.Member.id,
          nickname: assignee.Member.nickname,
          profileImage: assignee.Member.imageUrl,
        },
      })),
      cardLabels: card.CardLabel.map((cardLabel) => ({
        label: {
          id: cardLabel.Label.id,
          title: cardLabel.Label.title,
        },
      })),
      comments: card.Comment.map((comment) => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
        member: {
          id: comment.Member?.id ?? '', // Prisma Type 추론 시스템의 한계.
          email: comment.Member?.email ?? '',
          nickname: comment.Member?.nickname ?? '',
          imageUrl: comment.Member?.imageUrl ?? '',
        },
      })),
    };
  }
}
