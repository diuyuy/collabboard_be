import { Injectable, PipeTransform } from '@nestjs/common';
import z from 'zod';
import {
  ResponseCode,
  ResponseStatusFactory,
} from '../api-response/response-status';
import { CommonHttpException } from '../exception/common-http-exception';

@Injectable()
export class ParseEmailPipe implements PipeTransform {
  transform(value: string): string {
    const validator = z.email();

    const result = validator.safeParse(value);

    if (!result.success)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.INVALID_EMAIL_FORM),
      );

    return result.data;
  }
}
