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

/**
 * Service for managing discount operations, including creating,
 * retrieving, and deleting discount records.
 */
@Injectable()
export class DiscountsService {
  constructor(
    @InjectRepository(Discount)
    private readonly discountRepository: Repository<Discount>,
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
  ) {}

  /**
   * Creates a new discount record.
   *
   * @param createDiscountDto - Data transfer object containing the discount data.
   * @throws NotFoundException - Thrown if the associated car with car_id is not found.
   * @returns Promise<void> - Resolves when the discount is successfully created.
   */
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

  /**
   * Retrieves a paginated list of discounts.
   *
   * @param page - The page number for pagination (default is 1).
   * @param limit - The number of records per page (default is 10).
   * @throws BadRequestException - Thrown if page or limit values are invalid.
   * @returns Promise<Discount[]> - Resolves with an array of Discount entities.
   */
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

  /**
   * Deletes a discount record by ID.
   *
   * @param discount_id - The ID of the discount to be deleted.
   * @throws NotFoundException - Thrown if the discount with the specified ID is not found.
   * @returns Promise<void> - Resolves when the discount is successfully deleted.
   */
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
