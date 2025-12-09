import { ApiProperty } from '@nestjs/swagger';

export class FavoriteBoardResponseDto {
  @ApiProperty({
    description: 'Board ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
  })
  boardId: string;

  @ApiProperty({
    description: 'Whether the board is marked as favorite',
    example: true,
    type: Boolean,
  })
  isFavorite: boolean;

  constructor(boardId: string, isFavorite: boolean) {
    this.boardId = boardId;
    this.isFavorite = isFavorite;
  }

  static from(boardId: string, isFavorite: boolean): FavoriteBoardResponseDto {
    return new FavoriteBoardResponseDto(boardId, isFavorite);
  }
}
