import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateListPositionDto {
  @ApiProperty({
    description: 'The position of the list (lexorank string)',
    example: 'index0',
  })
  @IsString()
  @IsNotEmpty()
  position: string;
}
