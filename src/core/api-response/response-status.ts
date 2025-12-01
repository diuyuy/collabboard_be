import { HttpStatus } from '@nestjs/common';

export enum ResponseCode {
  //200
  OK = 'OK',

  //201
  CREATED = 'CREATED',
  MEMBER_CREATED = 'MEMBER_CREATED',
  WORKSPACE_CREATED = 'WORKSPACE_CREATED',

  //400 BAD REQUEST
  BAD_REQUEST = 'BAD_REQUEST',
  INVALID_VERIFYCATION_CODE = 'INVALID_VERIFYCATION_CODE',
  INVALID_AUTH_TOKEN = 'INVALID_AUTH_TOKEN',
  REFRESH_TOKEN_NOT_EXISTS = 'REFRESH_TOKEN_NOT_EXISTS',
  INVALID_EMAIL_FORM = 'INVALID_EMAIL_FORM',
  EMAIL_ALREADY_EXSITS = 'EMAIL_ALREADY_EXSITS',
  INVALID_ID_TYPE = 'INVALID_ID_TYPE',

  //401 Unauthorized
  UNAUTHORIZED = 'UNAUTHORIZED',
  INVALID_JWT_TOKEN = 'INVALID_JWT_TOKEN',
  INVALID_AUTH_FORMAT = 'INVALID_AUTH_FORMAT',
  INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',

  // 403 Forbidden
  FORBIDDEN = 'FORBIDDEN',
  WORKSPACE_ACCESS_DENIED = 'WORKSPACE_ACCESS_DENIED',

  // 404 Not Found
  NOT_FOUND = 'NOT_FOUND',
  MEMBER_NOT_FOUND = 'MEMBER_NOT_FOUND',
  EMAIL_NOT_FOUND = 'EMAIL_NOT_FOUND',
  WORKSPACE_NOT_FOUND = 'WORKSPACE_NOT_FOUND',

  // 500 Internal Server Error
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SEND_EMAIL_FAIL = 'SEND_EMAIL_FAIL',
  HASH_PASSWORD_FAIL = 'HASH_PASSWORD_FAIL',
}

export class ResponseStatus {
  readonly success: boolean;
  readonly code: string;
  readonly status: number;
  readonly message: string;
}

export class ResponseStatusFactory {
  static create(responseCode: ResponseCode): ResponseStatus {
    return this.statusMap[responseCode];
  }

  private static readonly statusMap: Record<ResponseCode, ResponseStatus> = {
    // 200
    [ResponseCode.OK]: {
      success: true,
      code: 'SUCCESS',
      status: HttpStatus.OK,
      message: '요청이 성공적으로 처리되었습니다.',
    },

    // 201
    [ResponseCode.CREATED]: {
      success: true,
      code: ResponseCode.CREATED,
      status: HttpStatus.CREATED,
      message: '리소스가 성공적으로 생성되었습니다.',
    },

    [ResponseCode.MEMBER_CREATED]: {
      success: true,
      code: ResponseCode.MEMBER_CREATED,
      status: HttpStatus.CREATED,
      message: '회원가입이 성공적으로 완료되었습니다..',
    },

    [ResponseCode.WORKSPACE_CREATED]: {
      success: true,
      code: ResponseCode.WORKSPACE_CREATED,
      status: HttpStatus.CREATED,
      message: 'Workspace가 성공적으로 생성되었습니다..',
    },

    // 400
    [ResponseCode.BAD_REQUEST]: {
      success: false,
      code: ResponseCode.BAD_REQUEST,
      status: HttpStatus.BAD_REQUEST,
      message: '잘못된 요청입니다.',
    },

    [ResponseCode.INVALID_VERIFYCATION_CODE]: {
      success: false,
      code: ResponseCode.INVALID_VERIFYCATION_CODE,
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 인증번호 입니다.',
    },

    [ResponseCode.INVALID_AUTH_TOKEN]: {
      success: false,
      code: ResponseCode.INVALID_AUTH_TOKEN,
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 인증 토큰입니다.',
    },

    [ResponseCode.REFRESH_TOKEN_NOT_EXISTS]: {
      success: false,
      code: ResponseCode.REFRESH_TOKEN_NOT_EXISTS,
      status: HttpStatus.BAD_REQUEST,
      message: '리프레시 토큰이 존재하지 않습니다.',
    },

    [ResponseCode.INVALID_EMAIL_FORM]: {
      success: false,
      code: ResponseCode.INVALID_EMAIL_FORM,
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 이메일 형식입니다.',
    },

    [ResponseCode.EMAIL_ALREADY_EXSITS]: {
      success: false,
      code: ResponseCode.EMAIL_ALREADY_EXSITS,
      status: HttpStatus.BAD_REQUEST,
      message: '이미 존재하는 이메일입니다.',
    },

    [ResponseCode.INVALID_ID_TYPE]: {
      success: false,
      code: ResponseCode.INVALID_ID_TYPE,
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 ID 타입 입니다.',
    },

    // 401
    [ResponseCode.UNAUTHORIZED]: {
      success: false,
      code: ResponseCode.UNAUTHORIZED,
      status: HttpStatus.UNAUTHORIZED,
      message: '인증이 필요합니다.',
    },

    [ResponseCode.INVALID_JWT_TOKEN]: {
      success: false,
      code: ResponseCode.INVALID_JWT_TOKEN,
      status: HttpStatus.UNAUTHORIZED,
      message: '인증이 필요합니다.',
    },

    [ResponseCode.INVALID_AUTH_FORMAT]: {
      success: false,
      code: ResponseCode.INVALID_AUTH_FORMAT,
      status: HttpStatus.UNAUTHORIZED,
      message: '유효하지 않은 인증 요청 형식입니다.',
    },

    [ResponseCode.INVALID_REFRESH_TOKEN]: {
      success: false,
      code: ResponseCode.INVALID_REFRESH_TOKEN,
      status: HttpStatus.UNAUTHORIZED,
      message: '유효하지 않은 리프레시 토큰입니다.',
    },

    // 403
    [ResponseCode.FORBIDDEN]: {
      success: false,
      code: ResponseCode.FORBIDDEN,
      status: HttpStatus.FORBIDDEN,
      message: '접근 권한이 없습니다.',
    },

    [ResponseCode.WORKSPACE_ACCESS_DENIED]: {
      success: false,
      code: ResponseCode.WORKSPACE_ACCESS_DENIED,
      status: HttpStatus.FORBIDDEN,
      message: '해당 워크스페이스에 대한 접근 권한이 없습니다.',
    },

    // 404
    [ResponseCode.NOT_FOUND]: {
      success: false,
      code: ResponseCode.NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
      message: '요청한 리소스를 찾을 수 없습니다.',
    },

    [ResponseCode.MEMBER_NOT_FOUND]: {
      success: false,
      code: ResponseCode.MEMBER_NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
      message: '해당 사용자를 찾을 수 없습니다.',
    },

    [ResponseCode.EMAIL_NOT_FOUND]: {
      success: false,
      code: ResponseCode.EMAIL_NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
      message: '해당 사용자를 찾을 수 없습니다.',
    },

    [ResponseCode.WORKSPACE_NOT_FOUND]: {
      success: false,
      code: ResponseCode.WORKSPACE_NOT_FOUND,
      status: HttpStatus.NOT_FOUND,
      message: '해당 워크스페이스를 찾을 수 없습니다.',
    },

    // 500
    [ResponseCode.INTERNAL_SERVER_ERROR]: {
      success: false,
      code: ResponseCode.INTERNAL_SERVER_ERROR,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '서버 내부 오류가 발생했습니다.',
    },

    [ResponseCode.SEND_EMAIL_FAIL]: {
      success: false,
      code: ResponseCode.SEND_EMAIL_FAIL,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '이메일 발송을 실패했습니다.',
    },

    [ResponseCode.HASH_PASSWORD_FAIL]: {
      success: false,
      code: ResponseCode.HASH_PASSWORD_FAIL,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '이메일 발송을 실패했습니다.',
    },
  };
}
