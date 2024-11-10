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

@Controller('discounts')
@UseInterceptors(ResponseInterceptor)
export class DiscountsController {
  private readonly logger: LoggerService = new LoggerService();

  constructor(private readonly discountsService: DiscountsService) {}

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
