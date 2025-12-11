import { Injectable, PipeTransform } from '@nestjs/common';
import z from 'zod';
import {
  ResponseCode,
  ResponseStatusFactory,
} from '../api-response/response-status';
import { CommonHttpException } from '../exception/common-http-exception';
import { PageSortOption } from '../types/types';

@Injectable()
export class ParsePageSortPipe<T> implements PipeTransform {
  constructor(private readonly validKeys: [T, ...T[]]) {}

  transform(value: string | undefined): PageSortOption<T> {
    if (!value) {
      return {
        sortProp: 'id' as T,
        sortDirection: 'desc',
      };
    }

    const validator = z.object({
      sortProp: z.enum(this.validKeys as [string, ...string[]]),
      sortDirection: z.union([z.literal('asc'), z.literal('desc')]),
    });

    const [sortProp, sortDirection = 'desc'] = value.split(',');

    const result = validator.safeParse({ sortProp, sortDirection });

    if (!result.success) {
      throw new CommonHttpException(
        ResponseStatusFactory.create(ResponseCode.INVALID_SORT_OPTION),
      );
    }

    return {
      sortProp: result.data.sortProp as T,
      sortDirection: result.data.sortDirection,
    };
  }
}
