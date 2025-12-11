import { ApiProperty } from '@nestjs/swagger';
import { CardPriority } from 'generated/prisma/client';
import { BoardDetailFromPrisma } from '../types/types';

class MemberDto {
  @ApiProperty({ example: 'uuid-user-1' })
  id: string;

  @ApiProperty({ example: 'DevKim' })
  nickname: string | null;
}

class LabelDto {
  @ApiProperty({ example: 'uuid-label-1' })
  id: string;

  @ApiProperty({ example: 'Backend' })
  title: string;

  @ApiProperty({ example: '#FF5733' })
  color: string;
}

class CardAssigneeDto {
  @ApiProperty({ type: MemberDto })
  Member: MemberDto;
}

class CardLabelDto {
  @ApiProperty({ type: LabelDto })
  Label: LabelDto;
}

class CardCountDto {
  @ApiProperty({ example: 5 })
  Comment: number;
}

class CardDetailDto {
  @ApiProperty({ example: 'uuid-card-1' })
  id: string;

  @ApiProperty({ example: 'Card' })
  title: string;

  @ApiProperty({ example: '1000' })
  position: string;

  @ApiProperty({ example: 'HIGH', enum: CardPriority })
  priority: CardPriority;

  @ApiProperty({ type: [CardAssigneeDto] })
  CardAssignee: CardAssigneeDto[];

  @ApiProperty({ type: [CardLabelDto] })
  CardLabel: CardLabelDto[];

  @ApiProperty({ type: CardCountDto })
  _count: CardCountDto;
}

class ListDetailDto {
  @ApiProperty({ example: 'uuid-list-1' })
  id: string;

  @ApiProperty({ example: 'List' })
  title: string;

  @ApiProperty({ example: '1000' })
  position: string;

  @ApiProperty({ type: [CardDetailDto] })
  Card: CardDetailDto[];
}

export class BoardDetailResponseDto {
  @ApiProperty({ example: 'uuid-board-1' })
  id: string;

  @ApiProperty({ example: 'CollabBoard Board' })
  title: string;

  @ApiProperty({ example: '#F5F5F5' })
  backgroundColor: string;

  @ApiProperty({ example: 'uuid-user-1' })
  ownerId: string | null;

  @ApiProperty({ type: [ListDetailDto] })
  List: ListDetailDto[];

  constructor(data: BoardDetailResponseDto) {
    this.id = data.id;
    this.title = data.title;
    this.backgroundColor = data.backgroundColor;
    this.ownerId = data.ownerId;
    this.List = data.List;
  }

  static from(board: BoardDetailFromPrisma): BoardDetailResponseDto {
    return new BoardDetailResponseDto({
      id: board.id,
      title: board.title,
      backgroundColor: board.backgroundColor,
      ownerId: board.ownerId,
      List: board.List || [],
    });
  }
}
