import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({
    description: 'Updated comment content',
    example: '수정된 댓글입니다.',
    maxLength: 3000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3000)
  content: string;
}
