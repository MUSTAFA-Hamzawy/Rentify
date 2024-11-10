import { Module } from '@nestjs/common';
import { CarsService } from './cars.service';
import { CarsController } from './cars.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from './entities/car.entity';
import { UploadModule } from '../../../common/modules/upload/upload.module';
import { Brand } from '../brands/entities/brand.entity';
import { Location } from '../locations/entities/location.entity';
import { CarPolicy } from './entities/car-policies.entity';
import { CarImage } from './entities/car-images.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Car, Brand, Location, CarPolicy, CarImage]),
    UploadModule,
  ],
  controllers: [CarsController],
  providers: [CarsService],
  exports: [CarsService],
})
export class CarsModule {}
