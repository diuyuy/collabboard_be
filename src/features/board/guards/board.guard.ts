import {
  CanActivate,
  ExecutionContext,
  Injectable,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from 'src/features/auth/types/types';
import { CardService } from 'src/features/card/card.service';
import { ListService } from 'src/features/list/list.service';
import { BoardService } from '../board.service';
import { BoardRole } from '../decorator/board-role';

@Injectable()
export class BoardGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly boardService: BoardService,
    private readonly listService: ListService,
    @Inject(forwardRef(() => CardService))
    private readonly cardService: CardService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accessBoardAuthority = this.reflector.get(
      BoardRole,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Get boardId from params, or derive it from listId/cardId if present
    let boardId = request.params.boardId;

    if (!boardId && request.params.listId) {
      // Get boardId from listId
      boardId = await this.listService.getBoardIdFromList(
        request.params.listId,
      );
      // Store it in request for downstream use
      request.params.boardId = boardId;
    }

    if (!boardId && request.params.cardId) {
      // Get boardId from cardId
      boardId = await this.cardService.getBoardIdFromCard(
        request.params.cardId,
      );
      // Store it in request for downstream use
      request.params.boardId = boardId;
    }

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
