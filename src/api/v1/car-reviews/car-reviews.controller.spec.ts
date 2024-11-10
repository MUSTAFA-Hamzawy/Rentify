import { Test, TestingModule } from '@nestjs/testing';
import { CarReviewsController } from './car-reviews.controller';
import { CarReviewsService } from './car-reviews.service';

describe('CarReviewsController', () => {
  let controller: CarReviewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CarReviewsController],
      providers: [CarReviewsService],
    }).compile();

    controller = module.get<CarReviewsController>(CarReviewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
