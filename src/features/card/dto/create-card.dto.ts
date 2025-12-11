import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { CardPriority } from 'generated/prisma/enums';

export class CreateCardDto {
  @ApiProperty({
    description: 'The title of the card',
    example: '로그인 페이지 퍼블리싱',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The description of the card',
    example: '반응형 디자인 적용 필요',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'The priority of the card',
    enum: CardPriority,
    example: CardPriority.HIGH,
    required: false,
  })
  @IsEnum(CardPriority)
  @IsOptional()
  priority?: CardPriority;

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

  @ApiProperty({
    description: 'Array of member IDs to assign to the card',
    example: ['uuid-member-1', 'uuid-member-2'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assigneeIds?: string[];

  @ApiProperty({
    description: 'Array of label IDs to attach to the card',
    example: ['uuid-label-1'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  labelIds?: string[];
}
