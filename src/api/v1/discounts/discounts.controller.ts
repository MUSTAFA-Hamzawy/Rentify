import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  HttpStatus,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { LoggerService } from '../../../common/modules/logger/logger.service';
import { ResponseStatus } from '../../../common/decorators/response-status.decorator';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/role.enum';
import { Discount } from './entities/discount.entity';

/**
 * Controller for handling discount-related operations, such as creating, retrieving,
 * and deleting discounts.
 */
@Controller('discounts')
@UseInterceptors(ResponseInterceptor)
export class DiscountsController {
  private readonly logger: LoggerService = new LoggerService();

  constructor(private readonly discountsService: DiscountsService) {}

  /**
   * Endpoint to create a new discount.
   *
   * @param createDiscountDto - The DTO containing the discount data.
   * @returns Promise<void> - Resolves when the discount is successfully created.
   * @throws Error - Thrown if an error occurs during discount creation.
   * @ResponseStatus(HttpStatus.CREATED) - Responds with HTTP status 201 upon successful creation.
   * @ResponseMessage('Discount added successfully.') - Message returned in the response.
   * @Roles(Role.Admin) - Endpoint accessible only to users with the Admin role.
   */
  @Post()
  @ResponseStatus(HttpStatus.CREATED)
  @ResponseMessage('Discount added successfully.')
  @Roles(Role.Admin)
  async create(@Body() createDiscountDto: CreateDiscountDto): Promise<void> {
    try {
      return await this.discountsService.create(createDiscountDto);
    } catch (error) {
      this.logger.error(error.message, `create, ${DiscountsController.name}`);
      throw error;
    }
  }

  /**
   * Endpoint to retrieve a paginated list of discounts.
   *
   * @param page - Page number for pagination (default is 1).
   * @param limit - Number of items per page for pagination (default is 20).
   * @returns Promise<Discount[]> - Resolves with an array of Discount entities.
   * @throws Error - Thrown if an error occurs while retrieving discounts.
   * @ResponseMessage('Discounts retrieved successfully.') - Message returned in the response.
   */
  @Get()
  @ResponseMessage('Discounts retrieved successfully.')
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ): Promise<Discount[]> {
    try {
      return await this.discountsService.findAll(page, limit);
    } catch (error) {
      this.logger.error(error.message, `findAll, ${DiscountsController.name}`);
      throw error;
    }
  }

  /**
   * Endpoint to delete a discount by its ID.
   *
   * @param id - ID of the discount to be deleted.
   * @returns Promise<void> - Resolves when the discount is successfully deleted.
   * @throws Error - Thrown if an error occurs during discount deletion.
   * @ResponseMessage('Discount removed successfully.') - Message returned in the response.
   */
  @Delete(':id')
  @ResponseMessage('Discount removed successfully.')
  async remove(@Param('id', ParseIntPipe) id: string): Promise<void> {
    try {
      return await this.discountsService.remove(+id);
    } catch (error) {
      this.logger.error(error.message, `remove, ${DiscountsController.name}`);
      throw error;
    }
  }
}
