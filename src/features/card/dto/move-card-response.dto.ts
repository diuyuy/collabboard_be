import { ApiProperty } from '@nestjs/swagger';

export class MoveCardResponseDto {
  @ApiProperty({ example: 'card-uuid-1234-5678' })
  id: string;

  @ApiProperty({ example: 'list-uuid-9999-8888' })
  listId: string;

  @ApiProperty({ example: '0|hzi:00001' })
  position: string;

  @ApiProperty({ example: '2024-05-21T10:00:00.000Z' })
  updatedAt: Date;

  constructor({ id, listId, position, updatedAt }: MoveCardResponseDto) {
    this.id = id;
    this.listId = listId;
    this.position = position;
    this.updatedAt = updatedAt;
  }

  static from(card: MoveCardResponseDto): MoveCardResponseDto {
    return new MoveCardResponseDto(card);
  }
}
