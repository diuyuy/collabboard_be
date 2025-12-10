import { forwardRef, Module } from '@nestjs/common';
import { CardModule } from '../card/card.module';
import { ListModule } from '../list/list.module';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { BoardGuard } from './guards/board.guard';

@Module({
  imports: [forwardRef(() => ListModule), forwardRef(() => CardModule)],
  controllers: [BoardController],
  providers: [BoardService, BoardGuard],
  exports: [BoardService, BoardGuard],
})
export class BoardModule {}
