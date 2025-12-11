import { ApiProperty } from '@nestjs/swagger';
import { CardPriority, CardStatus } from 'generated/prisma/client';
import { CardResponseFromPrisma } from '../types/types';

export class CardAssigneeDto {
  @ApiProperty({ example: 'uuid-member-1' })
  id: string;

  @ApiProperty({ example: 'John Doe', nullable: true })
  nickname: string | null;
}

export class CardLabelDto {
  @ApiProperty({ example: 'uuid-label-1' })
  id: string;

  @ApiProperty({ example: 'Bug' })
  title: string;

  @ApiProperty({ example: '#ff0000' })
  color: string;
}

export class CardResponseDto {
  @ApiProperty({ example: 'card-uuid-1234-5678' })
  id: string;

  @ApiProperty({ example: '로그인 페이지 퍼블리싱' })
  title: string;

  @ApiProperty({ example: '반응형 디자인 적용 필요', nullable: true })
  description: string | null;

  @ApiProperty({ example: 'list-uuid-9999-8888' })
  listId: string | null;

  @ApiProperty({ example: '0|hzi:00001' })
  position: string;

  @ApiProperty({ enum: CardPriority, example: CardPriority.MEDIUM })
  priority: CardPriority;

  @ApiProperty({ enum: CardStatus, example: CardStatus.TODO })
  status: CardStatus;

  @ApiProperty({ example: '2024-05-21T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-05-21T10:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: [CardAssigneeDto] })
  assignees: CardAssigneeDto[];

  @ApiProperty({ type: [CardLabelDto] })
  labels: CardLabelDto[];

  @ApiProperty({
    example: { comments: 0 },
    description: 'Count of related entities',
  })
  _count: {
    comments: number;
  };

  static from(card: CardResponseFromPrisma): CardResponseDto {
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
      assignees: (card.CardAssignee || []).map((assignee) => ({
        id: assignee.Member.id,
        nickname: assignee.Member.nickname,
      })),
      labels: (card.CardLabel || []).map((label) => ({
        id: label.Label.id,
        title: label.Label.title,
        color: label.Label.color,
      })),
      _count: {
        comments: card._count?.Comment || 0,
      },
    };
  }
}
