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
  ValidationPipe, ParseIntPipe, Query, DefaultValuePipe,
} from '@nestjs/common';
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LoggerService } from '../../../common/modules/logger/logger.service';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { ResponseStatus } from '../../../common/decorators/response-status.decorator';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Location } from './entities/location.entity';

/**
 * Controller for managing locations.
 * This controller handles requests for creating, retrieving, updating, and deleting locations.
 */
@Controller('locations')
@UseInterceptors(ResponseInterceptor)
export class LocationsController {
  private readonly logger: LoggerService = new LoggerService();

  constructor(private readonly locationsService: LocationsService) {}

  /**
   * Creates a new location.
   * @param createLocationDto - The data transfer object containing location details.
   * @returns The created Location entity.
   * @throws Error if creation fails.
   */
  @Post()
  @ResponseStatus(HttpStatus.CREATED)
  @ResponseMessage('Location added successfully.')
  async create(@Body(ValidationPipe) createLocationDto: CreateLocationDto): Promise<Location> {
    try {
      return this.locationsService.create(createLocationDto);
    } catch (error) {
      this.logger.error(error.message, `create, ${LocationsController.name}`);
      throw error;
    }
  }

  /**
   * Retrieves all locations with pagination.
   * @param page - The page number for pagination (default is 1).
   * @param limit - The number of locations to retrieve per page (default is 20).
   * @returns An array of Location entities.
   * @throws Error if retrieval fails.
   */
  @Get()
  @ResponseMessage('Brands retrieved successfully.')
  async findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number): Promise<Location[]> {
    try {
      return this.locationsService.findAll(page, limit);
    } catch (error) {
      this.logger.error(error.message, `findAll, ${LocationsController.name}`);
      throw error;
    }
  }

  /**
   * Retrieves a single location by its ID.
   * @param id - The ID of the location to retrieve.
   * @returns The Location entity.
   * @throws Error if the location is not found or retrieval fails.
   */
  @Get(':id')
  @ResponseMessage('Location retrieved successfully.')
  async findOne(@Param('id', ParseIntPipe) id: string): Promise<Location> {
    try {
      return this.locationsService.findOne(+id);
    } catch (error) {
      this.logger.error(error.message, `findOne, ${LocationsController.name}`);
      throw error;
    }
  }

  /**
   * Updates an existing location.
   * @param id - The ID of the location to update.
   * @param updateLocationDto - The data transfer object containing updated location details.
   * @returns The updated Location entity.
   * @throws Error if the location is not found or update fails.
   */
  @Patch(':id')
  @ResponseMessage('Location updated successfully.')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateLocationDto: UpdateLocationDto): Promise<Location> {
    try {
      return this.locationsService.update(+id, updateLocationDto);
    } catch (error) {
      this.logger.error(error.message, `update, ${LocationsController.name}`);
      throw error;
    }
  }

  /**
   * Deletes a location by its ID.
   * @param id - The ID of the location to delete.
   * @throws Error if the location is not found or deletion fails.
   */
  @Delete(':id')
  @ResponseMessage('Location removed successfully.')
  async remove(@Param('id', ParseIntPipe) id: string): Promise<void> {
    try {
      await this.locationsService.remove(+id);
    } catch (error) {
      this.logger.error(error.message, `remove, ${LocationsController.name}`);
      throw error;
    }
  }
}
