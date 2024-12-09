import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { RedisService } from './redis.service';
import * as process from 'node:process';

@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        return new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT, 10) || 6379,
          retryStrategy: (times) => {
            // Add retry strategy
            const delay = Math.min(times * 50, 2000);
            return delay;
          },
        });
      },
    },
    RedisService
  ],
  exports: ['REDIS_CLIENT', RedisService],
})
export class RedisModule {}
