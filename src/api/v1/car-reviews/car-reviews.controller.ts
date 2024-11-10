import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  HttpStatus,
  ValidationPipe,
  ParseIntPipe,
  Req,
  Query,
} from '@nestjs/common';
import { CarReviewsService } from './car-reviews.service';
import { CreateCarReviewDto } from './dto/create-car-review.dto';
import { UpdateCarReviewDto } from './dto/update-car-review.dto';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { LoggerService } from '../../../common/modules/logger/logger.service';
import { ResponseStatus } from '../../../common/decorators/response-status.decorator';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/role.enum';
import { CarReview } from './entities/car-review.entity';

/**
 * Controller responsible for handling car review-related endpoints.
 * It provides routes to create, retrieve, update, and delete car reviews.
 */
@Controller('car-reviews')
@UseInterceptors(ResponseInterceptor)
export class CarReviewsController {
  private readonly logger: LoggerService = new LoggerService();

  constructor(private readonly carReviewsService: CarReviewsService) {}

  /**
   * Creates a new car review.
   * @param createCarReviewDto - The DTO containing car review data.
   * @param req - The request object containing user information.
   * @returns The created car review object.
   */
  @Post()
  @ResponseStatus(HttpStatus.CREATED)
  @ResponseMessage('Review added successfully.')
  async create(
    @Body(ValidationPipe) createCarReviewDto: CreateCarReviewDto,
    @Req() req: any,
  ): Promise<CarReview> {
    try {
      const user_id: number = req.user.user_id;
      return await this.carReviewsService.create(createCarReviewDto, user_id);
    } catch (error) {
      this.logger.error(error.message, `create, ${CarReviewsController.name}`);
      throw error;
    }
  }

  /**
   * Retrieves a car review by its ID.
   * @param id - The ID of the car review to retrieve.
   * @returns The retrieved car review.
   */
  @Get(':id')
  @ResponseMessage('Review retrieved successfully.')
  async findOne(@Param('id', ParseIntPipe) id: string): Promise<CarReview> {
    try {
      return await this.carReviewsService.findOne(+id);
    } catch (error) {
      this.logger.error(error.message, `findOne, ${CarReviewsController.name}`);
      throw error;
    }
  }

  /**
   * Retrieves the rating of a car based on reviews.
   * @param car_id - The ID of the car to retrieve the rating for.
   * @returns The car's average rating.
   */
  @Get()
  @ResponseMessage('Rating retrieved successfully.')
  async findCarRating(
    @Query('car_id', ParseIntPipe) car_id: number,
  ): Promise<CarReview> {
    try {
      return await this.carReviewsService.findCarRating(+car_id);
    } catch (error) {
      this.logger.error(error.message, `findOne, ${CarReviewsController.name}`);
      throw error;
    }
  }

  /**
   * Updates an existing car review.
   * @param id - The ID of the review to update.
   * @param updateCarReviewDto - The DTO containing the updated review data.
   * @param req - The request object containing user information.
   * @returns A message indicating successful update.
   */
  @Patch(':id')
  @ResponseMessage('Review updated successfully.')
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body(ValidationPipe) updateCarReviewDto: UpdateCarReviewDto,
    @Req() req: any,
  ): Promise<void> {
    try {
      return await this.carReviewsService.update(
        +id,
        updateCarReviewDto,
        req.user.user_id,
      );
    } catch (error) {
      this.logger.error(error.message, `update, ${CarReviewsController.name}`);
      throw error;
    }
  }

  /**
   * Deletes a car review by its ID.
   * Only accessible to Admin users.
   * @param id - The ID of the review to delete.
   * @returns A message indicating successful deletion.
   */
  @Delete(':id')
  @ResponseMessage('Review removed successfully.')
  @Roles(Role.Admin)
  async remove(@Param('id', ParseIntPipe) id: string): Promise<void> {
    try {
      return await this.carReviewsService.remove(+id);
    } catch (error) {
      this.logger.error(error.message, `remove, ${CarReviewsController.name}`);
      throw error;
    }
  }
}
