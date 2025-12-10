import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class MoveCardDto {
  @ApiProperty({
    description: 'Target list ID',
    example: 'uuid',
  })
  @IsUUID('4')
  @IsNotEmpty()
  listId: string;

  @ApiProperty({
    description: 'Target position (lexorank string)',
    example: '0|hzj:00002',
  })
  @IsString()
  @IsNotEmpty()
  position: string;
}
