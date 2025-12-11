import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class MoveCardDto {
  @ApiProperty({
    description: 'Target list ID',
    example: 'uuid',
  })
  @IsUUID('4')
  @IsNotEmpty()
  listId: string;

  @ApiProperty({
    description: 'Position of the previous card (lexorank)',
    example: '0|hzzzzz:',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  previousPosition: string | null;

  @ApiProperty({
    description: 'Position of the next card (lexorank)',
    example: '0|i00007:',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nextPosition: string | null;
}
