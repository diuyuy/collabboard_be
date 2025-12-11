import { Module } from '@nestjs/common';
import { CommentModule } from '../comment/comment.module';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CardAccessGuard } from './guards/card-access.guard';
import { LexorankService } from './services/lexorank.service';

@Module({
  imports: [CommentModule],
  controllers: [CardController],
  providers: [CardService, LexorankService, CardAccessGuard],
  exports: [CardService],
})
export class CardModule {}
