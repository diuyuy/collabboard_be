import { forwardRef, Module } from '@nestjs/common';
import { BoardModule } from '../board/board.module';
import { CommentModule } from '../comment/comment.module';
import { ListModule } from '../list/list.module';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { LexorankService } from './services/lexorank.service';

@Module({
  imports: [
    CommentModule,
    forwardRef(() => ListModule),
    forwardRef(() => BoardModule),
  ],
  controllers: [CardController],
  providers: [CardService, LexorankService],
  exports: [CardService],
})
export class CardModule {}
