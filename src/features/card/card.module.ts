import { Module } from '@nestjs/common';
import { LexorankModule } from 'src/core/infrastructure/lexorank/lexorank.module';
import { CommentModule } from '../comment/comment.module';
import { CardController } from './card.controller';
import { CardService } from './card.service';
import { CardAccessGuard } from './guards/card-access.guard';

@Module({
  imports: [CommentModule, LexorankModule],
  controllers: [CardController],
  providers: [CardService, CardAccessGuard],
  exports: [CardService],
})
export class CardModule {}
