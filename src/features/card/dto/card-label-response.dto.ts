import { ApiProperty } from '@nestjs/swagger';

export class CardLabelResponseDto {
  @ApiProperty({ example: '990e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  cardId: string;

  @ApiProperty({ example: 'aa0e8400-e29b-41d4-a716-446655440000' })
  labelId: string;

  static from(cardLabel: {
    id: string;
    cardId: string;
    labelId: string;
  }): CardLabelResponseDto {
    return {
      id: cardLabel.id,
      cardId: cardLabel.cardId,
      labelId: cardLabel.labelId,
    };
  }
}
