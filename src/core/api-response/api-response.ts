import {
  ResponseCode,
  ResponseStatus,
  ResponseStatusFactory,
} from './response-status';

export class ApiResponse<T> {
  readonly success: boolean;
  readonly code: string;
  readonly message: string;
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
