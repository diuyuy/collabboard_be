import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateListDto {
  @ApiProperty({
    description: 'The title of the list',
    example: 'In Progress',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @ApiProperty({
    description: 'The position of the list (lexorank string)',
    example: 'index0',
    required: false,
  })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  position?: string;
}
