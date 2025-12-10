import { forwardRef, Module } from '@nestjs/common';
import { BoardModule } from '../board/board.module';
import { CardModule } from '../card/card.module';
import { ListController } from './list.controller';
import { ListService } from './list.service';

@Module({
  imports: [forwardRef(() => BoardModule), forwardRef(() => CardModule)],
  controllers: [ListController],
  providers: [ListService],
  exports: [ListService],
})
export class ListModule {}
