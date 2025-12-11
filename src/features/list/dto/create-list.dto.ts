import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateListDto {
  @ApiProperty({
    description: 'The title of the list',
    example: 'To Do',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'The position of the list (lexorank string)',
    example: '0|hzzzzz:',
  })
  @IsString()
  @IsNotEmpty()
  position: string;
}
