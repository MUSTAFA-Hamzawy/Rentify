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

@Controller('locations')
@UseInterceptors(ResponseInterceptor)
export class LocationsController {
  private readonly logger: LoggerService = new LoggerService();

  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ResponseStatus(HttpStatus.CREATED)
  @ResponseMessage('Location added successfully.')
  async create(@Body(ValidationPipe) createLocationDto: CreateLocationDto) {
    try {
      return this.locationsService.create(createLocationDto);
    } catch (error) {
      this.logger.error(error.message, `create, ${LocationsController.name}`);
      throw error;
    }
  }

  @Get()
  @ResponseMessage('Brands retrieved successfully.')
  async findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number) {
    try {
      return this.locationsService.findAll(page, limit);
    } catch (error) {
      this.logger.error(error.message, `findAll, ${LocationsController.name}`);
      throw error;
    }
  }

  @Get(':id')
  @ResponseMessage('Location retrieved successfully.')
  async findOne(@Param('id', ParseIntPipe) id: string) {
    try {
      return this.locationsService.findOne(+id);
    } catch (error) {
      this.logger.error(error.message, `findOne, ${LocationsController.name}`);
      throw error;
    }
  }

  @Patch(':id')
  @ResponseMessage('Location updated successfully.')
  async update(@Param('id', ParseIntPipe) id: string, @Body() updateLocationDto: UpdateLocationDto) {
    try {
      return this.locationsService.update(+id, updateLocationDto);
    } catch (error) {
      this.logger.error(error.message, `update, ${LocationsController.name}`);
      throw error;
    }
  }

  @Delete(':id')
  @ResponseMessage('Location removed successfully.')
  async remove(@Param('id', ParseIntPipe) id: string) {
    try {
      await this.locationsService.remove(+id);
    } catch (error) {
      this.logger.error(error.message, `remove, ${LocationsController.name}`);
      throw error;
    }
  }
}
