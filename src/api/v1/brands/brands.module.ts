import { Module } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Brand } from './entities/brand.entity';
import { UploadModule } from '../../../common/modules/upload/upload.module';
import { RedisModule } from '../../../common/modules/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([Brand]), UploadModule, RedisModule],
  controllers: [BrandsController],
  providers: [BrandsService],
  exports: [BrandsService],
})
export class BrandsModule {}
