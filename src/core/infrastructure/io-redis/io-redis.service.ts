import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';
import { MODULE_OPTIONS_TOKEN } from './io-redis.module-definition';

@Injectable()
export class IoRedisService extends Redis implements OnModuleDestroy {
  constructor(@Inject(MODULE_OPTIONS_TOKEN) options: RedisOptions) {
    super(options);
  }

  async scanAndDelete(pattern: string) {
    let cursor = '0';
    let totalDeleted = 0;
    const keysToDelete: string[] = [];

    do {
      const [nextCursor, keys] = await this.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        100,
      );
      cursor = nextCursor;
      keysToDelete.push(...keys);
    } while (cursor !== '0');

    if (keysToDelete.length > 0) {
      totalDeleted = await this.del(...keysToDelete);
    }

    return totalDeleted;
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
