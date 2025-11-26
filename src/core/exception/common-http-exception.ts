import { HttpException } from '@nestjs/common';
import { ResponseStatus } from '../api-response/response-status';

export class CommonHttpException extends HttpException {
  constructor(reponseStatus: ResponseStatus) {
    super(reponseStatus, reponseStatus.status);
  }
}
