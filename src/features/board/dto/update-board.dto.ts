import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateBoardDto {
  @ApiProperty({
    description: 'Board title',
    example: 'Updated Project Title',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  @MinLength(1)
  title?: string;

  @ApiProperty({
    description: 'Board description',
    example: 'Updated board description',
    required: false,
    type: String,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Board background color in hex format',
    example: '#336699',
    required: false,
    type: String,
  })
  @IsHexColor()
  @IsOptional()
  backgroundColor?: string;
}
