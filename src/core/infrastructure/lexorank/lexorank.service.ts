import { Injectable } from '@nestjs/common';
import { LexoRank } from 'lexorank';

@Injectable()
export class LexorankService {
  generatePosition(
    previousPosition: string | null | undefined,
    nextPosition: string | null | undefined,
  ): string {
    if (!previousPosition && !nextPosition) return this.generateFirst();

    if (previousPosition && nextPosition) {
      return this.generateBetween(previousPosition, nextPosition);
    }

    if (previousPosition && !nextPosition)
      return this.generateAfter(previousPosition);

    // It can't be null or undefined.
    return this.generateBefore(nextPosition!);
  }

  /**
   * Generate position for a new list or card at the Empty array.
   */
  private generateFirst(): string {
    return LexoRank.middle().toString();
  }

  /**
   * Generate position between two cards
   */
  private generateBetween(prevPosition: string, nextPosition: string): string {
    const prev = LexoRank.parse(prevPosition);
    const next = LexoRank.parse(nextPosition);
    return prev.between(next).toString();
  }

  /**
   * Generate position after a card
   */
  private generateAfter(position: string): string {
    const current = LexoRank.parse(position);
    const max = LexoRank.max();
    return current.between(max).toString();
  }

  /**
   * Generate position before a card
   */
  private generateBefore(position: string): string {
    const current = LexoRank.parse(position);
    const min = LexoRank.min();
    return min.between(current).toString();
  }
}
