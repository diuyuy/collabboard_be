import { ApiProperty } from '@nestjs/swagger';
import {
  IsHexColor,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateBoardDto {
  @ApiProperty({
    description: 'Board title',
    example: 'Project Alpha',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Board description',
    example: 'Main project board for Alpha team',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  description?: string;

  @ApiProperty({
    description: 'Board background color in hex format',
    example: '#4A90E2',
    type: String,
  })
  @IsHexColor()
  @IsNotEmpty()
  backgroundColor: string;
}
