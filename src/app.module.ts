import { Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './api/v1/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { MailerService } from './common/modules/mailer/mailer.service';
import { MailerModule } from './common/modules/mailer/mailer.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './api/v1/guards/auth.guard';
import { TokenBlackList } from './api/v1/users/entities/token-blacklist.entity';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { LoggerModule } from './common/modules/logger/logger.module';
import { LoggerService } from './common/modules/logger/logger.service';
import { UploadService } from './common/modules/upload/upload.service';
import { UploadModule } from './common/modules/upload/upload.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { TransformTimestampInterceptor } from './common/interceptors/transform-timestamp.interceptor';
import { DbModule } from './database/db.module';
import { User } from './api/v1/users/entities/user.entity';
import { BrandsModule } from './api/v1/brands/brands.module';
import { LocationsModule } from './api/v1/locations/locations.module';
import { ContactUsModule } from './api/v1/contact-us/contact-us.module';
import { RolesGuard } from './api/v1/guards/roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 1000, // Time to live : 1 second
        limit: process.env.NODE_ENV === 'test' ? 1000 : 3, // 3 requests per 1 second for each user
      },
    ]),
    TypeOrmModule.forFeature([User, TokenBlackList]),
    UsersModule,
    MailerModule,
    LoggerModule,
    UploadModule,
    DbModule,
    BrandsModule,
    LocationsModule,
    ContactUsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformTimestampInterceptor,
    },
    Logger,
    AppService,
    MailerService,
    LoggerService,
    UploadService,
  ],
})
export class AppModule {}
