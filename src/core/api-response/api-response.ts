import { ApiProperty } from '@nestjs/swagger';
import {
  ResponseCode,
  ResponseStatus,
  ResponseStatusFactory,
} from './response-status';

export class ApiResponse<T> {
  @ApiProperty({
    description: 'Indicates whether the request was successful',
    example: true,
    type: Boolean,
  })
  readonly success: boolean;

  @ApiProperty({
    description: 'Response code indicating the result of the operation',
    example: 'OK',
    type: String,
  })
  readonly code: string;

  @ApiProperty({
    description: 'Human-readable message describing the result',
    example: 'Request processed successfully',
    type: String,
  })
  readonly message: string;

  @ApiProperty({
    description: 'Response data payload (type varies by endpoint)',
    required: false,
    nullable: true,
  })
  readonly data?: T;

  constructor(responseStatus: ResponseStatus, data?: T) {
    this.success = responseStatus.success;
    this.code = responseStatus.code;
    this.message = responseStatus.message;
    this.data = data;
  }

  static from<T>(responseStatus: ResponseStatus, data?: T): ApiResponse<T> {
    return new ApiResponse(responseStatus, data);
  }

  static success<T>(data?: T): ApiResponse<T> {
    return new ApiResponse(ResponseStatusFactory.create(ResponseCode.OK), data);
  }

  static error(responseCode: ResponseCode): ApiResponse<void> {
    return new ApiResponse(ResponseStatusFactory.create(responseCode));
  }
}
