import { Module } from '@nestjs/common';
import { ListModule } from '../list/list.module';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { BoardAccessGuard } from './guards/board-access.guard';

@Module({
  imports: [ListModule],
  controllers: [BoardController],
  providers: [BoardService, BoardAccessGuard],
  exports: [BoardService],
})
export class BoardModule {}
