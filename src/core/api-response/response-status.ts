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
  INVALID_NONNEGATIVE_INTEGER = 'INVALID_NONNEGATIVE_INTEGER',
  INVALID_SORT_OPTION = 'INVALID_SORT_OPTION',
  WORKSPACE_ALREADY_EXSITS = 'WORKSPACE_ALREADY_EXSITS',
  MEMBER_DOES_NOT_EXSIT = 'MEMBER_DOES_NOT_EXSIT',

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
  INVITATION_NOT_FOUND = 'INVITATION_NOT_FOUND',
  BOARD_NOT_FOUND = 'BOARD_NOT_FOUND',

  // 409 Conflict
  CONFLICT = 'CONFLICT',
  INVITATION_ALREADY_PROCESSED = 'INVITATION_ALREADY_PROCESSED',
  MEMBER_ALREADY_IN_WORKSPACE = 'MEMBER_ALREADY_IN_WORKSPACE',

  // 500 Internal Server Error
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  SEND_EMAIL_FAIL = 'SEND_EMAIL_FAIL',
  HASH_PASSWORD_FAIL = 'HASH_PASSWORD_FAIL',
}

export class ResponseStatus {
  readonly success: boolean;
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
      status: HttpStatus.OK,
      message: '요청이 성공적으로 처리되었습니다.',
    },

    // 201
    [ResponseCode.CREATED]: {
      success: true,
      status: HttpStatus.CREATED,
      message: '리소스가 성공적으로 생성되었습니다.',
    },

    [ResponseCode.MEMBER_CREATED]: {
      success: true,
      status: HttpStatus.CREATED,
      message: '회원가입이 성공적으로 완료되었습니다..',
    },

    [ResponseCode.WORKSPACE_CREATED]: {
      success: true,
      status: HttpStatus.CREATED,
      message: 'Workspace가 성공적으로 생성되었습니다..',
    },

    // 400
    [ResponseCode.BAD_REQUEST]: {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: '잘못된 요청입니다.',
    },

    [ResponseCode.INVALID_VERIFYCATION_CODE]: {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 인증번호 입니다.',
    },

    [ResponseCode.INVALID_AUTH_TOKEN]: {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 인증 토큰입니다.',
    },

    [ResponseCode.REFRESH_TOKEN_NOT_EXISTS]: {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: '리프레시 토큰이 존재하지 않습니다.',
    },

    [ResponseCode.INVALID_EMAIL_FORM]: {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 이메일 형식입니다.',
    },

    [ResponseCode.EMAIL_ALREADY_EXSITS]: {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: '이미 존재하는 이메일입니다.',
    },

    [ResponseCode.INVALID_ID_TYPE]: {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: '유효하지 않은 ID 타입 입니다.',
    },

    [ResponseCode.INVALID_NONNEGATIVE_INTEGER]: {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: '음수가 아닌 정수 값이어야 합니다.',
    },

    [ResponseCode.INVALID_SORT_OPTION]: {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: '잘못된 정렬 옵션입니다.',
    },

    [ResponseCode.WORKSPACE_ALREADY_EXSITS]: {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: '이미 존재하는 워크스페이스입니다.',
    },

    [ResponseCode.MEMBER_DOES_NOT_EXSIT]: {
      success: false,
      status: HttpStatus.BAD_REQUEST,
      message: '존재하지 않는 이메일입니다.',
    },

    // 401
    [ResponseCode.UNAUTHORIZED]: {
      success: false,
      status: HttpStatus.UNAUTHORIZED,
      message: '인증이 필요합니다.',
    },

    [ResponseCode.INVALID_JWT_TOKEN]: {
      success: false,
      status: HttpStatus.UNAUTHORIZED,
      message: '인증이 필요합니다.',
    },

    [ResponseCode.INVALID_AUTH_FORMAT]: {
      success: false,
      status: HttpStatus.UNAUTHORIZED,
      message: '잘못된 이메일 혹은 비밀번호 입니다.',
    },

    [ResponseCode.INVALID_REFRESH_TOKEN]: {
      success: false,
      status: HttpStatus.UNAUTHORIZED,
      message: '유효하지 않은 리프레시 토큰입니다.',
    },

    // 403
    [ResponseCode.FORBIDDEN]: {
      success: false,
      status: HttpStatus.FORBIDDEN,
      message: '접근 권한이 없습니다.',
    },

    [ResponseCode.WORKSPACE_ACCESS_DENIED]: {
      success: false,
      status: HttpStatus.FORBIDDEN,
      message: '해당 워크스페이스에 대한 접근 권한이 없습니다.',
    },

    // 404
    [ResponseCode.NOT_FOUND]: {
      success: false,
      status: HttpStatus.NOT_FOUND,
      message: '요청한 리소스를 찾을 수 없습니다.',
    },

    [ResponseCode.MEMBER_NOT_FOUND]: {
      success: false,
      status: HttpStatus.NOT_FOUND,
      message: '해당 사용자를 찾을 수 없습니다.',
    },

    [ResponseCode.EMAIL_NOT_FOUND]: {
      success: false,
      status: HttpStatus.NOT_FOUND,
      message: '해당 사용자를 찾을 수 없습니다.',
    },

    [ResponseCode.WORKSPACE_NOT_FOUND]: {
      success: false,
      status: HttpStatus.NOT_FOUND,
      message: '해당 워크스페이스를 찾을 수 없습니다.',
    },

    [ResponseCode.INVITATION_NOT_FOUND]: {
      success: false,
      status: HttpStatus.NOT_FOUND,
      message: '해당 초대를 찾을 수 없습니다.',
    },

    [ResponseCode.BOARD_NOT_FOUND]: {
      success: false,
      status: HttpStatus.NOT_FOUND,
      message: '해당 보드를 찾을 수 없습니다.',
    },

    // 409
    [ResponseCode.CONFLICT]: {
      success: false,
      status: HttpStatus.CONFLICT,
      message: '리소스 충돌이 발생했습니다.',
    },

    [ResponseCode.INVITATION_ALREADY_PROCESSED]: {
      success: false,
      status: HttpStatus.CONFLICT,
      message: '이미 처리된 초대입니다.',
    },

    [ResponseCode.MEMBER_ALREADY_IN_WORKSPACE]: {
      success: false,
      status: HttpStatus.CONFLICT,
      message: '이미 워크스페이스의 멤버입니다.',
    },

    // 500
    [ResponseCode.INTERNAL_SERVER_ERROR]: {
      success: false,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '서버 내부 오류가 발생했습니다.',
    },

    [ResponseCode.SEND_EMAIL_FAIL]: {
      success: false,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '이메일 발송을 실패했습니다.',
    },

    [ResponseCode.HASH_PASSWORD_FAIL]: {
      success: false,
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '이메일 발송을 실패했습니다.',
    },
  };
}
