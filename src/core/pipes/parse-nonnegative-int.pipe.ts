import { Injectable, PipeTransform } from '@nestjs/common';
import z from 'zod';
import {
  ResponseCode,
  ResponseStatusFactory,
} from '../api-response/response-status';
import { CommonHttpException } from '../exception/common-http-exception';

@Injectable()
export class ParseNonnegativeIntPipe implements PipeTransform {
  transform(value: string): number {
    const validator = z.number().nonnegative();

    const result = validator.safeParse(Number(value));

    if (!result.success)
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.INVALID_NONNEGATIVE_INTEGER),
      );

    return result.data;
  }
}
