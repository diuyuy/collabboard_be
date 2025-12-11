import { Injectable } from '@nestjs/common';
import { LexoRank } from 'lexorank';

@Injectable()
export class LexorankService {
  /**
   * Generate position for a new card at the start
   */
  generateFirst(): string {
    return LexoRank.min().toString();
  }

  /**
   * Generate position for a new card at the end (or middle)
   */
  generateLast(): string {
    return LexoRank.middle().toString();
  }

  /**
   * Generate position between two cards
   */
  generateBetween(prevPosition: string, nextPosition: string): string {
    const prev = LexoRank.parse(prevPosition);
    const next = LexoRank.parse(nextPosition);
    return prev.between(next).toString();
  }

  /**
   * Generate position after a card
   */
  generateAfter(position: string): string {
    const current = LexoRank.parse(position);
    const max = LexoRank.max();
    return current.between(max).toString();
  }

  /**
   * Generate position before a card
   */
  generateBefore(position: string): string {
    const current = LexoRank.parse(position);
    const min = LexoRank.min();
    return min.between(current).toString();
  }
}
