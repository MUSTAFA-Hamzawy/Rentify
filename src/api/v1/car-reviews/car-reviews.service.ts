import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCarReviewDto } from './dto/create-car-review.dto';
import { UpdateCarReviewDto } from './dto/update-car-review.dto';
import { EntityNotFoundError, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '../cars/entities/car.entity';
import { CarReview } from './entities/car-review.entity';
import { Helpers } from '../../../common/helpers/helpers.class';

/**
 * Service responsible for handling car reviews logic.
 * Provides methods to create, find, update, and delete car reviews.
 */
@Injectable()
export class CarReviewsService {
  constructor(
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
    @InjectRepository(CarReview)
    private readonly carReviewRepository: Repository<CarReview>,
  ) {}

  /**
   * Creates a new car review.
   *
   * @param createCarReviewDto - The data transfer object containing the car review information.
   * @param user_id - The ID of the user submitting the review.
   *
   * @returns The created car review.
   *
   * @throws NotFoundException if the car does not exist.
   * @throws Error for other errors that may occur during the process.
   */
  async create(
    createCarReviewDto: CreateCarReviewDto,
    user_id: number,
  ): Promise<CarReview> {
    try {
      await this.carRepository.findOneOrFail({
        where: { car_id: createCarReviewDto.car_id },
        select: ['car_id'],
      });

      return await this.carReviewRepository.save({
        ...createCarReviewDto,
        user_id: user_id,
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Car not found');
      throw new Error(error);
    }
  }

  /**
   * Finds the average rating for a specific car.
   *
   * @param car_id - The ID of the car for which to calculate the average review rating.
   *
   * @returns An object containing the average review rating for the car.
   *
   * @throws NotFoundException if the car is not found or the average rating can't be calculated.
   * @throws Error for other errors during the process.
   */
  async findCarRating(car_id: number): Promise<CarReview> {
    try {
      return await this.carReviewRepository
        .createQueryBuilder('reviews')
        .select('AVG(reviews.review_rate)', 'avg_rate')
        .where('reviews.car_id = :car_id', { car_id })
        .getRawOne();
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Car not found');
      throw new Error(error);
    }
  }

  /**
   * Finds a car review by its ID.
   *
   * @param id - The ID of the review to find.
   *
   * @returns The car review, including user details (name, image).
   *
   * @throws NotFoundException if the review is not found.
   * @throws Error for other errors during the process.
   */
  async findOne(id: number): Promise<CarReview> {
    try {
      const review: CarReview = await this.carReviewRepository
        .createQueryBuilder('review')
        .leftJoinAndSelect('review.user', 'user')
        .select([
          'review.review_id',
          'review.review_text',
          'review.review_rate',
          'review.created_at',
          'review.updated_at',
          'user.full_name',
          'user.image',
        ])
        .where('review_id =:id', { id })
        .getOne();

      if (!review) throw new NotFoundException('Review not found');

      review.user.image = Helpers.getStaticFilePublicPath(review.user.image);

      return review;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      throw new Error(error);
    }
  }

  /**
   * Updates an existing car review.
   *
   * @param review_id - The ID of the review to update.
   * @param updateCarReviewDto - The DTO containing the new review data.
   * @param user_id - The ID of the user attempting to update the review.
   *
   * @returns void
   *
   * @throws UnauthorizedException if the user does not own the review.
   * @throws NotFoundException if the review is not found.
   * @throws Error for other errors during the process.
   */
  async update(
    review_id: number,
    updateCarReviewDto: UpdateCarReviewDto,
    user_id: number,
  ): Promise<void> {
    try {
      const review: CarReview = await this.carReviewRepository.findOneOrFail({
        where: { review_id },
      });

      if (review.user_id !== user_id)
        throw new UnauthorizedException(
          'You are not allowed to update this review.',
        );

      review.review_rate = updateCarReviewDto.review_rate
        ? updateCarReviewDto.review_rate
        : review.review_rate;
      review.review_text = updateCarReviewDto.review_text
        ? updateCarReviewDto.review_text
        : review.review_text;

      await this.carReviewRepository.update(review_id, review);
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Review not found');
      if (error instanceof UnauthorizedException)
        throw new NotFoundException(error.message);
      throw new Error(error);
    }
  }

  /**
   * Deletes a car review.
   *
   * @param review_id - The ID of the review to delete.
   *
   * @returns void
   *
   * @throws NotFoundException if the review is not found.
   * @throws Error for other errors during the process.
   */
  async remove(review_id: number): Promise<void> {
    try {
      const review: CarReview = await this.carReviewRepository.findOneOrFail({
        where: { review_id },
        select: ['review_id'],
      });

      await this.carReviewRepository.delete(review.review_id);
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Review not found');
      throw new Error(error);
    }
  }
}
