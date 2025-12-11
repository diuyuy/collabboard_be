import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'Comment content',
    example:
      '이 작업은 내일까지 완료 가능할 것 같습니다. @john 확인 부탁드립니다!',
  })
  @IsString()
  @IsNotEmpty()
  content: string;
}
