import { ApiProperty } from '@nestjs/swagger';
import { CardPriority } from 'generated/prisma/enums';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateCardDto {
  @ApiProperty({
    description: 'The title of the card',
    example: '로그인 페이지 UI 구현',
    required: false,
  })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'The description of the card',
    example:
      '## 작업 상세\n- 소셜 로그인 버튼 추가\n- 이메일 유효성 검사 로직 적용',
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
    description: 'Array of member IDs to assign to the card',
    example: ['550e8400-e29b-41d4-a716-446655440000'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assigneeIds?: string[];

  @ApiProperty({
    description: 'Array of label IDs to attach to the card',
    example: ['label-uuid-1111', 'label-uuid-2222'],
    type: [String],
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  labelIds?: string[];

  // NOTE: listId and position are explicitly EXCLUDED
  // Use the PATCH /cards/:cardId/move endpoint to change these
}
