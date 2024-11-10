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
  UploadedFiles,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { LoggerService } from '../../../common/modules/logger/logger.service';
import { UploadService } from '../../../common/modules/upload/upload.service';
import { ResponseStatus } from '../../../common/decorators/response-status.decorator';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Multer } from 'multer';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../../config/multer.config';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/role.enum';
import { UpdateCarPoliciesDto } from './dto/update-car-policies-dto';
import { MAX_NUM_OF_IMAGES_PER_CAR } from '../../../config/app.config';
import { Car } from './entities/car.entity';
/**
 * Controller to handle car-related operations.
 * This controller provides endpoints to manage car data, including creating, retrieving,
 * updating, and deleting cars, as well as updating car images and policies.
 */
@Controller('cars')
@UseInterceptors(ResponseInterceptor)
export class CarsController {
  private readonly logger: LoggerService = new LoggerService();

  constructor(
    private readonly carsService: CarsService,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * Creates a new car record.
   * Accessible only by users with the Admin role.
   * @param createCarDto - Data Transfer Object for creating a car.
   */
  @Post()
  @ResponseStatus(HttpStatus.CREATED)
  @ResponseMessage('Car added successfully.')
  @Roles(Role.Admin)
  async create(@Body(ValidationPipe) createCarDto: CreateCarDto): Promise<Car> {
    try {
      return this.carsService.create(createCarDto);
    } catch (error) {
      this.logger.error(error.message, `create, ${CarsController.name}`);
      throw error;
    }
  }

  /**
   * Retrieves a paginated list of all cars.
   * @param page - Page number for pagination, defaults to 1.
   * @param limit - Maximum number of records per page, defaults to 10.
   * @returns A list of car records.
   */
  @Get()
  @ResponseMessage('Cars retrieved successfully.')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<Car[]> {
    try {
      return await this.carsService.findAll(page, limit);
    } catch (error) {
      this.logger.error(error.message, `findAll, ${CarsController.name}`);
      throw error;
    }
  }

  /**
   * Retrieves a paginated list of available cars only.
   * @param page - Page number for pagination, defaults to 1.
   * @param limit - Maximum number of records per page, defaults to 10.
   * @returns A list of available car records.
   */
  @Get('available')
  @ResponseMessage('Cars retrieved successfully.')
  async findAvailableCars(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<Car[]> {
    try {
      return await this.carsService.findAll(page, limit, true);
    } catch (error) {
      this.logger.error(
        error.message,
        `findAvailableCars, ${CarsController.name}`,
      );
      throw error;
    }
  }

  /**
   * Retrieves a car by its ID.
   * @param id - ID of the car to be retrieved.
   * @returns The car record.
   */
  @Get(':id')
  @Get()
  @ResponseMessage('Car retrieved successfully.')
  async findOne(@Param('id', ParseIntPipe) id: string): Promise<Car> {
    try {
      return await this.carsService.findOne(+id);
    } catch (error) {
      this.logger.error(error.message, `findOne, ${CarsController.name}`);
      throw error;
    }
  }

  /**
   * Updates a car's data by its ID.
   * Accessible only by users with the Admin role.
   * @param id - ID of the car to be updated.
   * @param updateCarDto - Data Transfer Object for updating a car.
   */
  @Patch(':id')
  @ResponseMessage('Car updated successfully.')
  @Roles(Role.Admin)
  async update(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateCarDto: UpdateCarDto,
  ) {
    try {
      return await this.carsService.update(+id, updateCarDto);
    } catch (error) {
      this.logger.error(error.message, `update, ${CarsController.name}`);
      throw error;
    }
  }

  /**
   * Updates images for a specified car.
   * Accessible only by users with the Admin role.
   * @param car_images - Array of images to be uploaded.
   * @param carId - ID of the car to update images for.
   */
  @Patch('images/:car_id')
  @ResponseMessage('Car images updated successfully.')
  @UseInterceptors(
    FilesInterceptor('car_images', MAX_NUM_OF_IMAGES_PER_CAR, multerConfig),
  )
  @Roles(Role.Admin)
  async updateCarImages(
    @UploadedFiles() car_images: Multer.File[],
    @Param('car_id', ParseIntPipe) carId: string,
  ): Promise<void> {
    try {
      // Validate car images
      await this.uploadService.validateMultipleImages(car_images);
      const images_name: string[] = [...car_images.map(img => img.filename)];
      await this.carsService.updateCarImages(images_name, +carId);
    } catch (error) {
      this.logger.error(
        error.message,
        `updateCarImages, ${CarsController.name}`,
      );
      throw error;
    }
  }

  /**
   * Updates policies for a specified car.
   * Accessible only by users with the Admin role.
   * @param carId - ID of the car to update policies for.
   * @param updateCarPoliciesDto - Data Transfer Object for updating car policies.
   */
  @Patch('policies/:car_id')
  @ResponseMessage('Car policies successfully.')
  @Roles(Role.Admin)
  async updateCarPolicies(
    @Param('car_id', ParseIntPipe) carId: string,
    @Body(ValidationPipe) updateCarPoliciesDto: UpdateCarPoliciesDto,
  ): Promise<void> {
    try {
      return this.carsService.updateCarPolicies(
        updateCarPoliciesDto.policies,
        +carId,
      );
    } catch (error) {
      this.logger.error(
        error.message,
        `updateCarPolicies, ${CarsController.name}`,
      );
      throw error;
    }
  }

  /**
   * Deletes a car record by marking it as unavailable.
   * Accessible only by users with the Admin role.
   * @param id - ID of the car to be deleted.
   */
  @Delete(':id')
  @ResponseMessage('This car is now unavailable.')
  @Roles(Role.Admin)
  async remove(@Param('id', ParseIntPipe) id: string): Promise<void> {
    try {
      return this.carsService.remove(+id);
    } catch (error) {
      this.logger.error(error.message, `remove, ${CarsController.name}`);
      throw error;
    }
  }
}
