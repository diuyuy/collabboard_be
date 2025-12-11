import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddCardLabelDto {
  @ApiProperty({
    description: 'Label ID to add to the card',
    example: 'aa0e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  @IsNotEmpty()
  labelId: string;
}
