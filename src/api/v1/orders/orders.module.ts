import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Car } from '../cars/entities/car.entity';
import { MailerModule } from '../../../common/modules/mailer/mailer.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Car]), MailerModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
