import { Module } from '@nestjs/common';
import { ListModule } from '../list/list.module';
import { BoardController } from './board.controller';
import { BoardService } from './board.service';
import { BoardGuard } from './guards/board.guard';

@Module({
  imports: [ListModule],
  controllers: [BoardController],
  providers: [BoardService, BoardGuard],
  exports: [BoardService],
})
export class BoardModule {}
