import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Discount } from './entities/discount.entity';
import { Car } from '../cars/entities/car.entity';

@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
  ) {}

  async create(createDiscountDto: CreateDiscountDto): Promise<void> {
    try {
      await this.carRepository.findOneByOrFail({
        car_id: createDiscountDto.car_id,
      });
      await this.discountRepository.save(createDiscountDto);
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Car Not found.');
      throw new Error(error);
    }
  }

  async findAll(page: number = 1, limit: number = 10): Promise<Discount[]> {
    try {
      if (page <= 0 || limit <= 0)
        throw new BadRequestException('Invalid request params.');

      return await this.discountRepository.find({
        skip: (page - 1) * limit,
        take: limit,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async remove(discount_id: number): Promise<void> {
    try {
      await this.discountRepository.findOneByOrFail({ discount_id });
      await this.discountRepository.delete(discount_id);
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Discount Not found.');
      throw new Error(error);
    }
  }
}
