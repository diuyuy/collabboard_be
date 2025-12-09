import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from 'src/features/auth/types/types';
import { BoardService } from '../board.service';
import { BoardRole } from '../decorator/board-role';

@Injectable()
export class BoardGuard implements CanActivate {
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
    const boardId = request.params.boardId;

    if (accessBoardAuthority.length === 0) return true;

    if (accessBoardAuthority[0] === 'VIEW') {
      await this.boardService.AccessBoardAuthority(request.user.id, boardId);

      return true;
    }

    await this.boardService.validateModifyBoardAuthority(
      request.user.id,
      boardId,
    );

    return true;
  }
}
