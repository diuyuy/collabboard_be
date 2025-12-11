import { SetMetadata } from '@nestjs/common';

export const CAN_MODIFY_COMMENT = 'CAN_MODIFY_COMMENT';
export const CanModifyComment = () => SetMetadata(CAN_MODIFY_COMMENT, true);
