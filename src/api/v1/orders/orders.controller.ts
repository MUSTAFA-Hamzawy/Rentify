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
  Req,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderPaymentDto } from './dto/update-order.dto';
import { ResponseInterceptor } from '../../../common/interceptors/response.interceptor';
import { LoggerService } from '../../../common/modules/logger/logger.service';
import { ResponseStatus } from '../../../common/decorators/response-status.decorator';
import { ResponseMessage } from '../../../common/decorators/response-message.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { Role } from '../../../common/role.enum';

@Controller('orders')
@UseInterceptors(ResponseInterceptor)
export class OrdersController {
  private readonly logger: LoggerService = new LoggerService();

  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ResponseStatus(HttpStatus.CREATED)
  @ResponseMessage('Order placed successfully.')
  async create(
    @Body(ValidationPipe) createOrderDto: CreateOrderDto,
    @Req() req: any,
  ) {
    try {
      return await this.ordersService.create(createOrderDto, {
        userId: req.user.user_id,
        userName: req.user.fullName,
        email: req.user.email,
        preferredCurrency: req.user.preferredCurrency,
      });
    } catch (error) {
      this.logger.error(error.message, `create, ${OrdersController.name}`);
      throw error;
    }
  }

  @Get()
  @ResponseMessage('Orders retrieved successfully.')
  @Roles(Role.Admin)
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    try {
      return this.ordersService.findAll(page, limit);
    } catch (error) {
      this.logger.error(error.message, `findAll, ${OrdersController.name}`);
      throw error;
    }
  }

  @Get('user')
  @ResponseMessage('Orders retrieved successfully.')
  async findAllPerUser(
    @Req() req: any,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    try {
      return this.ordersService.findAllPerUser(page, limit, req.user.user_id);
    } catch (error) {
      this.logger.error(
        error.message,
        `findAllPerUser, ${OrdersController.name}`,
      );
      throw error;
    }
  }

  @Patch(':id')
  @ResponseMessage('Order status updated successfully.')
  @Roles(Role.Admin)
  async updateOrderStatus(
    @Param('id', ParseIntPipe) id: string,
    @Body(ValidationPipe) updateOrderDto: UpdateOrderDto,
    @Req() req: any,
  ) {
    try {
      return this.ordersService.updateOrderStatus(+id, updateOrderDto, {
        userId: req.user.user_id,
        userName: req.user.fullName,
        email: req.user.email,
      });
    } catch (error) {
      this.logger.error(
        error.message,
        `updateOrderStatus, ${OrdersController.name}`,
      );
      throw error;
    }
  }

  @Patch('payment/:id')
  @ResponseMessage('Payment status updated successfully.')
  @Roles(Role.Admin)
  async updatePaymentStatus(
    @Param('id', ParseIntPipe) id: string,
    @Body(ValidationPipe) updateOrderPaymentDto: UpdateOrderPaymentDto,
  ) {
    return this.ordersService.updatePaymentStatus(+id, updateOrderPaymentDto);
  }
  catch(error) {
    this.logger.error(
      error.message,
      `updatePaymentStatus, ${OrdersController.name}`,
    );
    throw error;
  }

  @Patch('cancel/:id')
  @ResponseMessage('Order cancelled successfully.')
  async cancelOrder(@Param('id', ParseIntPipe) id: string, @Req() req: any) {
    try {
      return await this.ordersService.cancelOrder(+id, {
        userId: req.user.user_id,
        userName: req.user.fullName,
        email: req.user.email,
      });
    } catch (error) {
      this.logger.error(error.message, `cancelOrder, ${OrdersController.name}`);
      throw error;
    }
  }

  @Delete(':id')
  @ResponseMessage('Order cancelled successfully.')
  @Roles(Role.Admin)
  async remove(@Param('id', ParseIntPipe) id: string, @Req() req: any) {
    try {
      return await this.ordersService.cancelOrder(
        +id,
        {
          userId: req.user.user_id,
          userName: req.user.fullName,
          email: req.user.email,
        },
        true,
      );
    } catch (error) {
      this.logger.error(error.message, `remove, ${OrdersController.name}`);
      throw error;
    }
  }
}
