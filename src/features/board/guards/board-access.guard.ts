import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from 'src/features/auth/types/types';
import { BoardService } from 'src/features/board/board.service';
import { BoardRole } from '../decorators/board-role.decorator';

@Injectable()
export class BoardAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly boardService: BoardService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accessBoardAuthority = this.reflector.get(
      BoardRole,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Get boardId directly from params
    const boardId = request.params.boardId;

    if (accessBoardAuthority.length === 0) return true;

    if (accessBoardAuthority[0] === 'VIEW') {
      await this.boardService.validateAccessBoardAuthority(
        request.user.id,
        boardId,
      );

      return true;
    }

    await this.boardService.validateModifyBoardAuthority(
      request.user.id,
      boardId,
    );

    return true;
  }
}
