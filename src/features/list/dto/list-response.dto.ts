import { ApiProperty } from '@nestjs/swagger';
import { List } from 'generated/prisma/client';

export class ListResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the list',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The board ID this list belongs to',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  boardId: string;

  @ApiProperty({
    description: 'The title of the list',
    example: 'To Do',
  })
  title: string;

  @ApiProperty({
    description: 'The position of the list (lexorank string)',
    example: '0|hzzzzz:',
  })
  position: string;

  @ApiProperty({
    description: 'The cards in this list',
    type: 'array',
    items: { type: 'object' },
    example: [],
  })
  cards: unknown[];

  constructor({ id, boardId, title, position, cards }: ListResponseDto) {
    this.id = id;
    this.boardId = boardId;
    this.title = title;
    this.position = position;
    this.cards = cards;
  }

  static from(list: List): ListResponseDto {
    return new ListResponseDto({
      ...list,
      cards: [],
    });
  }
}
