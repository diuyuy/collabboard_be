import z from 'zod';
import {
  ResponseCode,
  ResponseStatusFactory,
} from '../api-response/response-status';
import { CommonHttpException } from '../exception/common-http-exception';

export const validateUUID = (value: string) => {
  const validator = z.uuid();

  const result = validator.safeParse(value);

  if (!result.success)
    throw new CommonHttpException(
      ResponseStatusFactory.create(ResponseCode.INVALID_ID_TYPE),
    );
};
