import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { validateUUID } from 'src/core/utils/validate-uuid';
import { RequestWithUser } from 'src/features/auth/types/types';
import { CardService } from 'src/features/card/card.service';
import { CardRole } from '../decorators/card-role.decorator';

@Injectable()
export class CardAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly cardService: CardService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accessCardAuthority = this.reflector.get(
      CardRole,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Get cardId from params and derive boardId from it
    const cardId = request.params.cardId;

    validateUUID(cardId);

    if (accessCardAuthority.length === 0) return true;

    if (accessCardAuthority[0] === 'VIEW') {
      await this.cardService.validateAccessCardAuthority(
        request.user.id,
        cardId,
      );

      return true;
    }

    await this.cardService.validateModifyCardAuthority(request.user.id, cardId);

    return true;
  }
}
