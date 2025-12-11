import { ApiProperty } from '@nestjs/swagger';
import { Board } from 'generated/prisma/client';

export class BoardResponseDto {
  @ApiProperty({
    description: 'Board ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'Board title',
    example: 'Project Alpha',
    type: String,
  })
  title: string;

  @ApiProperty({
    description: 'Board description',
    example: 'Main project board for Alpha team',
    nullable: true,
    type: String,
  })
  description: string | null;

  @ApiProperty({
    description: 'Board background color in hex format',
    example: '#4A90E2',
    type: String,
  })
  backgroundColor: string;

  @ApiProperty({
    description: 'Whether the board is marked as favorite by the current user',
    example: true,
    required: false,
    type: Boolean,
  })
  isFavorite?: boolean;

  @ApiProperty({
    description: 'Number of lists in the board',
    example: 5,
    required: false,
    type: Number,
  })
  listCount?: number;

  @ApiProperty({
    description: 'Number of cards in the board',
    example: 23,
    required: false,
    type: Number,
  })
  cardCount?: number;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-12-08T10:00:00.000Z',
    type: Date,
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-12-08T10:00:00.000Z',
    type: Date,
  })
  updatedAt: Date;

  constructor(data: BoardResponseDto) {
    this.id = data.id;
    this.title = data.title;
    this.description = data.description;
    this.backgroundColor = data.backgroundColor;
    this.isFavorite = data.isFavorite;
    this.listCount = data.listCount;
    this.cardCount = data.cardCount;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static from(
    board: Board,
    isFavorite?: boolean,
    listCount?: number,
    cardCount?: number,
  ): BoardResponseDto {
    return new BoardResponseDto({
      id: board.id,
      title: board.title,
      description: board.description,
      backgroundColor: board.backgroundColor,
      isFavorite,
      listCount,
      cardCount,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
    });
  }
}
