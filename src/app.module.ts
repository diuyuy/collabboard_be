import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REDIS_ENV } from './core/config/redis-env';
import { EnvSchema, validateEnv } from './core/config/validateEnv';
import { IoRedisModule } from './core/infrastructure/io-redis/io-redis.module';
import { PrismaModule } from './core/infrastructure/prisma-module/prisma.module';
import { AuthModule } from './features/auth/auth.module';

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
        port: configService.get<number>(REDIS_ENV.REDIS_PORT),
        isGlobal: true,
      }),
      inject: [ConfigService],
    }),
    PrismaModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
