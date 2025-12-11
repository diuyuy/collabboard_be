import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RequestWithUser } from 'src/features/auth/types/types';
import { ListService } from 'src/features/list/list.service';
import { ListRole } from '../decorators/list-role.decorator';

@Injectable()
export class ListAccessGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly listService: ListService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const accessListAuthority = this.reflector.get(
      ListRole,
      context.getHandler(),
    );
    const request = context.switchToHttp().getRequest<RequestWithUser>();

    // Get listId from params and derive boardId from it
    const listId = request.params.listId;

    if (accessListAuthority.length === 0) return true;

    if (accessListAuthority[0] === 'VIEW') {
      await this.listService.validateAccessListAuthority(
        request.user.id,
        listId,
      );

      return true;
    }

    await this.listService.validateModifyListAuthority(request.user.id, listId);

    return true;
  }
}
