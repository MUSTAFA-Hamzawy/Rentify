import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, UpdateOrderPaymentDto } from './dto/update-order.dto';
import { Brand } from '../brands/entities/brand.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Car } from '../cars/entities/car.entity';
import { MailerService } from '../../../common/modules/mailer/mailer.service';
import { CC } from 'currency-converter-lt';
import { Helpers } from '../../../common/helpers/helpers.class';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
    private readonly mailService: MailerService,
  ) {}

  private calculateTotalPrice(
    carRentalPrice: number,
    rentalInterval: number,
    discount: number,
  ): number {
    return (
      rentalInterval * (carRentalPrice - carRentalPrice * (discount / 100))
    );
  }

  private async getRentalInterval(
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const rentalInterval: number = endDate.getTime() - startDate.getTime();
    return Math.ceil(rentalInterval / (24 * 60 * 60 * 1000));
  }

  async create(
    createOrderDto: CreateOrderDto,
    user: {
      userId: number;
      userName: string;
      email: string;
      preferredCurrency: string;
    },
  ): Promise<void> {
    try {
      // check car is available
      const car: Car = await this.carRepository
        .createQueryBuilder('car')
        .leftJoinAndSelect(
          'car.discounts',
          'discount',
          'discount.end_date > :today',
          { today: new Date().toISOString() },
        )
        .where('car.car_id = :carId', { carId: createOrderDto.car_id })
        .andWhere('car.is_available = true')
        .select([
          'car.car_id',
          'car.is_available',
          'car.rental_price',
          'car.minimum_rental_period',
          'discount.discount_percentage',
        ])
        .getOne();

      if (!car) throw new NotFoundException('Car Not found or not available');

      // calculate total price
      const pickupDate: Date = new Date(createOrderDto.pickup_date);
      const dropOffDate: Date = new Date(createOrderDto.dropoff_date);
      const rentalInterval: number = await this.getRentalInterval(
        pickupDate,
        dropOffDate,
      );
      const discount: number =
        car.discounts.length > 0 ? car.discounts[0].discount_percentage : 0;
      const totalPrice: number = this.calculateTotalPrice(
        car.rental_price,
        rentalInterval,
        discount,
      );

      // validation on renting interval
      if (car.minimum_rental_period > rentalInterval)
        throw new BadRequestException(
          `Minimum renting interval for this car is ${car.minimum_rental_period} days`,
        );

      // save the order
      const order: Order = new Order();
      order.order_status = 'pending';
      order.payment_state = 'pending';
      order.user_id = user.userId;
      order.car_id = createOrderDto.car_id;
      order.pickup_date = pickupDate;
      order.dropoff_date = dropOffDate;
      order.total_price = totalPrice;
      await this.orderRepository.save(order);

      // email for the customer
      await this.mailService.sendOrderMail(user.email, {
        orderId: order.order_id,
        rentalInterval,
        totalPrice: `${await Helpers.convertCurrency('USD', user.preferredCurrency, totalPrice)} ${user.preferredCurrency}`,
        orderStatus: 'Pending',
        userName: user.userName,
      });

      // make the car un-available
      car.is_available = false;
      await this.carRepository.save(car);
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      if (error instanceof BadRequestException)
        throw new BadRequestException(error.message);
      throw new Error(error);
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    try {
      if (page <= 0 || limit <= 0)
        throw new BadRequestException('Invalid request params.');

      const orders: any = await this.orderRepository.find({
        skip: (page - 1) * limit,
        take: limit,
      });
    } catch (error) {
      if (error instanceof BadRequestException)
        throw new BadRequestException(error.message);
      throw new Error(error);
    }
  }

  async findAllPerUser(page: number = 1, limit: number = 10, userId: number) {
    try {
      if (page <= 0 || limit <= 0)
        throw new BadRequestException('Invalid request params.');

      return await this.orderRepository
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.user', 'user')
        .leftJoinAndSelect('order.car', 'car')
        .select([
          'order.order_id',
          'order.order_status',
          'order.pickup_date',
          'order.dropoff_date',
          'order.total_price',
          'order.payment_state',
          'user.user_id',
          'user.full_name',
          'car.car_id',
          'car.car_name',
        ])
        .where('order.user_id=:userId', { userId })
        .skip((page - 1) * limit)
        .take(limit)
        .getMany();
    } catch (error) {
      if (error instanceof BadRequestException)
        throw new BadRequestException(error.message);
      throw new Error(error);
    }
  }

  async updateStatus(
    id: number,
    updateOrderDto: UpdateOrderDto | UpdateOrderPaymentDto,
  ) {
    try {
      const order: Order = await this.orderRepository.findOneOrFail({
        where: { order_id: id },
        select: ['order_id', 'order_status', 'user_id'],
      });
      await this.orderRepository.update(order.order_id, updateOrderDto);
      return order;
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Order not found');

      throw new Error(error);
    }
  }

  async updateOrderStatus(
    id: number,
    updateOrderDto: UpdateOrderDto,
    user: { userId: number; userName: string; email: string },
  ) {
    try {
      const orderInfo = await this.updateStatus(id, {
        order_status: updateOrderDto.order_status,
      });

      // email for the customer
      await this.mailService.sendOrderMail(user.email, {
        orderId: orderInfo.order_id,
        orderStatus: updateOrderDto.order_status,
        userName: user.userName,
      });
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);

      throw new Error(error);
    }
  }

  async updatePaymentStatus(
    id: number,
    updateOrderPaymentDto: UpdateOrderPaymentDto,
  ) {
    try {
      await this.updateStatus(id, {
        payment_state: updateOrderPaymentDto.payment_state,
      });
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);

      throw new Error(error);
    }
  }

  async cancelOrder(
    id: number,
    user: { userId: number; userName: string; email: string },
    isAdmin: boolean = false,
  ): Promise<void> {
    try {
      const order: Order = await this.orderRepository.findOneOrFail({
        where: { order_id: id },
        select: ['order_id', 'order_status', 'user_id'],
      });

      // check that the order owner who is requesting to cancel
      if (order.user_id !== user.userId && !isAdmin)
        throw new ForbiddenException(
          'You are not allowed to cancel this order.',
        );

      await this.carRepository.findOneOrFail({
        where: { car_id: order.car_id },
        select: ['car_id', 'is_available'],
      });
      await this.orderRepository.update(order.order_id, {
        order_status: 'canceled',
      });

      // email for the customer
      await this.mailService.sendOrderMail(user.email, {
        orderId: order.order_id,
        orderStatus: 'Cancelled',
        userName: user.userName,
      });

      // make the car available
      await this.carRepository.update(
        { car_id: order.car_id },
        { is_available: true },
      );
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Order not found');

      if (error instanceof ForbiddenException)
        throw new NotFoundException(error.message);

      throw new Error(error);
    }
  }
}
