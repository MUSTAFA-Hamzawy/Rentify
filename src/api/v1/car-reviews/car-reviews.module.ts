import { Module } from '@nestjs/common';
import { CarReviewsService } from './car-reviews.service';
import { CarReviewsController } from './car-reviews.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car } from '../cars/entities/car.entity';
import { CarReview } from './entities/car-review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CarReview, Car])],
  controllers: [CarReviewsController],
  providers: [CarReviewsService],
})
export class CarReviewsModule {}
