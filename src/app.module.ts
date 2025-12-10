import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { REDIS_ENV } from './core/config/redis-env';
import { EnvSchema, validateEnv } from './core/config/validateEnv';
import { GlobalExceptionFilter } from './core/exception/global-exception-filter';
import { HttpExceptionFilter } from './core/exception/http-exception-filter';
import { IoRedisModule } from './core/infrastructure/io-redis/io-redis.module';
import { PrismaModule } from './core/infrastructure/prisma-module/prisma.module';
import { AuthModule } from './features/auth/auth.module';
import { BoardModule } from './features/board/board.module';
import { CardModule } from './features/card/card.module';
import { CommentModule } from './features/comment/comment.module';
import { LabelModule } from './features/label/label.module';
import { ListModule } from './features/list/list.module';
import { WorkspaceModule } from './features/workspace/workspace.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env'],
      isGlobal: true,
      validate: validateEnv,
    }),
    IoRedisModule.forRootAsync({
      useFactory: (configService: ConfigService<EnvSchema, true>) => ({
        host: configService.get<string>(REDIS_ENV.REDIS_HOST),
        port: +configService.get<string>(REDIS_ENV.REDIS_PORT),
        isGlobal: true,
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
    WorkspaceModule,
    BoardModule,
    ListModule,
    CardModule,
    LabelModule,
    CommentModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
