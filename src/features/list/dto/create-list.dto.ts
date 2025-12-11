import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateListDto {
  @ApiProperty({
    description: 'The title of the list',
    example: 'To Do',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'Position of the previous list (lexorank)',
    example: '0|hzzzzz:',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  previousPosition: string | null;

  @ApiProperty({
    description: 'Position of the next list (lexorank)',
    example: '0|i00007:',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nextPosition: string | null;
}
