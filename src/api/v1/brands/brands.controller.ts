import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  ParseIntPipe, HttpStatus, ValidationPipe, UploadedFile, DefaultValuePipe,
} from '@nestjs/common';
import { Multer } from 'multer';
import { BrandsService } from './brands.service';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { LoggerService } from '../../../common/modules/logger/logger.service';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Brand } from './entities/brand.entity';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { ResponseStatus } from '../../../common/decorators/response-status.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerConfig } from '../../../config/multer.config';
import { UploadService } from '../../../common/modules/upload/upload.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/role.enum';

/**
 * Controller for handling brand-related operations.
 */
@Controller('brands')
@UseInterceptors(ResponseInterceptor)
@Roles(Role.Admin)
export class BrandsController {
  private readonly logger: LoggerService = new LoggerService();

  constructor(private readonly brandsService: BrandsService, private readonly uploadService: UploadService) {}

  /**
   * Creates a new brand with the provided data and logo.
   * @param brand_logo The logo of the brand as a file.
   * @param createBrandDto The data transfer object containing brand details.
   * @returns The newly created brand.
   */
  @Post()
  @ResponseStatus(HttpStatus.CREATED)
  @ResponseMessage('Brand added successfully.')
  @UseInterceptors(FileInterceptor('brand_logo', multerConfig))
  async create(@UploadedFile() brand_logo: Multer.File, @Body(ValidationPipe) createBrandDto: CreateBrandDto): Promise<Brand> {
    try {
      // Validate the logo
      await this.uploadService.validateImage(brand_logo);

      // Creating new brand
      return this.brandsService.create({ brandDto: createBrandDto, brand_logo: brand_logo.filename });
    } catch (error) {
      this.logger.error(error.message, `create, ${BrandsController.name}`);
      throw error;
    }
  }

  /**
   * Retrieves all brands with optional pagination.
   * @param page The page number for pagination (optional).
   * @param limit The number of brands to retrieve per page (optional).
   * @returns A list of brands.
   */
  @Get()
  @ResponseMessage('Brands retrieved successfully.')
  async findAll(@Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number, @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number): Promise<Brand[]> {
    try {
      return await this.brandsService.findAll(page, limit);
    } catch (error) {
      this.logger.error(error.message, `findAll, ${BrandsController.name}`);
      throw error;
    }
  }

  /**
   * Retrieves a single brand by its ID.
   * @param id The ID of the brand to retrieve.
   * @returns The requested brand.
   */
  @Get(':id')
  @ResponseMessage('Brand retrieved successfully.')
  async findOne(@Param('id', ParseIntPipe) id: string): Promise<Brand> {
    try {
      return this.brandsService.findOne(+id);
    } catch (error) {
      this.logger.error(error.message, `findOne, ${BrandsController.name}`);
      throw error;
    }
  }

  /**
   * Updates an existing brand's details, optionally with a new logo.
   * @param brand_logo The new logo file for the brand (optional).
   * @param updateBrandDto The data transfer object containing updated brand details.
   * @returns The updated brand.
   */
  @Patch('')
  @ResponseMessage('Brand updated successfully.')
  @UseInterceptors(FileInterceptor('brand_logo', multerConfig))
  @Roles(Role.Admin)
  async update(@UploadedFile(ValidationPipe) brand_logo: Multer.File = null, @Body() updateBrandDto: UpdateBrandDto): Promise<Brand> {
    try {
      // Validate the logo
      if (brand_logo) await this.uploadService.validateImage(brand_logo);

      // Updating brand
      return this.brandsService.update({ updateDto: updateBrandDto, brand_logo: brand_logo ? brand_logo.filename : null });
    } catch (error) {
      this.logger.error(error.message, `update, ${BrandsController.name}`);
      throw error;
    }
  }

  /**
   * Deletes a brand by its ID.
   * @param id The ID of the brand to delete.
   */
  @Delete(':id')
  @ResponseMessage('Brand removed successfully.')
  @Roles(Role.Admin)
  async remove(@Param('id', ParseIntPipe) id: string): Promise<void> {
    try {
      await this.brandsService.remove(+id);
    } catch (error) {
      this.logger.error(error.message, `remove, ${BrandsController.name}`);
      throw error;
    }
  }
}
