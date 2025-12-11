import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AddCardAssigneeDto {
  @ApiProperty({
    description: 'Member ID to assign to the card',
    example: '880e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID('4')
  @IsNotEmpty()
  memberId: string;
}
