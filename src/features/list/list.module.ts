import { Module } from '@nestjs/common';
import { LexorankModule } from '../../core/infrastructure/lexorank/lexorank.module';
import { CardModule } from '../card/card.module';
import { ListAccessGuard } from './guards/list-access.guard';
import { ListController } from './list.controller';
import { ListService } from './list.service';

@Module({
  imports: [CardModule, LexorankModule],
  controllers: [ListController],
  providers: [ListService, ListAccessGuard],
  exports: [ListService],
})
export class ListModule {}
