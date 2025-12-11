import { Module } from '@nestjs/common';
import { LexorankService } from './lexorank.service';

@Module({
  providers: [LexorankService],
  exports: [LexorankService],
})
export class LexorankModule {}
