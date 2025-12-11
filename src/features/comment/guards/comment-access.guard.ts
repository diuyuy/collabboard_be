import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from 'src/features/auth/types/types';
import { CommentService } from '../comment.service';
import { CAN_MODIFY_COMMENT } from '../decorators/can-modify-comment';

@Injectable()
export class CommentAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly commentService: CommentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const canModifyComment = this.reflector.get<boolean | undefined>(
      CAN_MODIFY_COMMENT,
      context.getHandler(),
    );

    if (canModifyComment) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const commentId = request.params.commentId;

    await this.commentService.validateModifyCommentAuthority(
      request.user.id,
      commentId,
    );

    return true;
  }
}
