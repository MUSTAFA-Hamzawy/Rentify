import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { MailerModule } from 'common/modules/mailer/mailer.module';
import { TokenBlackList } from './entities/token-blacklist.entity';
import { UploadModule } from 'common/modules/upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, TokenBlackList]),
    MailerModule,
    UploadModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
