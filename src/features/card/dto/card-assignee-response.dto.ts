import { ApiProperty } from '@nestjs/swagger';

export class CardAssigneeResponseDto {
  @ApiProperty({ example: '770e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  cardId: string;

  @ApiProperty({ example: '880e8400-e29b-41d4-a716-446655440000' })
  memberId: string;

  @ApiProperty({ example: '2025-12-10T16:00:00Z' })
  createdAt: Date;

  static from(cardAssignee: {
    id: string;
    cardId: string;
    memberId: string;
    createdAt: Date;
  }): CardAssigneeResponseDto {
    return {
      id: cardAssignee.id,
      cardId: cardAssignee.cardId,
      memberId: cardAssignee.memberId,
      createdAt: cardAssignee.createdAt,
    };
  }
}
