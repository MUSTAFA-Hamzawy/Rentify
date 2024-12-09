import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Car } from './entities/car.entity';
import { Brand } from '../brands/entities/brand.entity';
import { Location } from '../locations/entities/location.entity';
import { CarPolicy } from './entities/car-policies.entity';
import { CarImage } from './entities/car-images.entity';
import { Helpers } from '../../../common/helpers/helpers.class';
import { RedisService } from '../../../common/modules/redis/redis.service';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class CarsService {
  constructor(
    @InjectRepository(Car) private readonly carRepository: Repository<Car>,
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    @InjectRepository(Location)
    private readonly locationRepository: Repository<Location>,
    @InjectRepository(CarPolicy)
    private readonly carPoliciesRepository: Repository<CarPolicy>,
    @InjectRepository(CarImage)
    private readonly carImagesRepository: Repository<CarImage>,
    private readonly redisService: RedisService,
  ) {}

  /**
   * Creates a new car entry in the database.
   * Checks if brand and location exist before saving the car.
   * @param createCarDto - Data transfer object containing car details.
   * @throws NotFoundException if brand or location are not found.
   * @throws Error for any other database errors.
   */
  async create(createCarDto: CreateCarDto): Promise<Car> {
    try {
      await this.brandRepository.findOneOrFail({
        where: { brand_id: createCarDto.brand_id },
        select: ['brand_id'],
      });
      await this.locationRepository.findOneOrFail({
        where: { location_id: createCarDto.pickup_location_id },
        select: ['location_id'],
      });
      await this.locationRepository.findOneOrFail({
        where: { location_id: createCarDto.dropoff_location_id },
        select: ['location_id'],
      });
      createCarDto.rental_price =
        Math.floor(createCarDto.rental_price * 100) / 100;

      const car: Car = await this.carRepository.save(createCarDto);
      await this.redisService.zadd('cars', car.car_id, JSON.stringify(car));
      return car;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        if (error.message.includes('Brand'))
          throw new NotFoundException('Brand Not Found.');
        if (error.message.includes('Location'))
          throw new NotFoundException('Location Not Found.');
      }
      throw new Error(error);
    }
  }

  /**
   * Retrieves all cars with pagination and optional availability filtering.
   * @param page - Current page number.
   * @param limit - Number of items per page.
   * @param onlyAvailable - If true, fetch only available cars.
   * @throws BadRequestException if page or limit values are invalid.
   * @returns Array of cars with related brand, location, policy, and image data.
   */
  async findAll(
    page: number = 1,
    limit: number = 10,
    onlyAvailable: boolean = false,
  ) {
    try {
      if (page <= 0 || limit <= 0)
        throw new BadRequestException('Invalid request params.');

      const query = this.carRepository
        .createQueryBuilder('cars')
        .leftJoinAndSelect('cars.brand', 'brand')
        .leftJoinAndSelect('cars.pickup_location', 'pickup_location')
        .leftJoinAndSelect('cars.dropoff_location', 'dropoff_location')
        .leftJoinAndSelect('cars.policies', 'policies')
        .leftJoinAndSelect('cars.images', 'images')
        .leftJoinAndSelect(
          'cars.discounts',
          'discounts',
          'discounts.end_date > :today',
          { today: new Date().toISOString() },
        )
        .select([
          'cars.car_id',
          'cars.car_name',
          'cars.rental_price',
          'cars.number_of_seats',
          'cars.created_at',
          'cars.updated_at',
          'images.image_path',
          'discounts.discount_percentage',
        ])
        .skip((page - 1) * limit)
        .take(limit);

      if (onlyAvailable) query.where('cars.is_available = true');

      const cars: any = await query.getMany();

      cars.map(
        car =>
          (car.images =
            car.images.length > 0 ? car.images[0].image_path : null),
      );

      return cars;
    } catch (error) {
      if (error instanceof BadRequestException)
        throw new BadRequestException(error.message);
      throw new Error(error);
    }
  }

  /**
   * Retrieves a specific car by its ID with all associated data.
   * @param id - Car ID.
   * @param useCache : a flag to determine whether we need to use cache memory or not.
   * @throws NotFoundException if the car is not found.
   * @returns Car details including brand, location, policy, and image data.
   */
  async findOne(id: number, useCache: boolean = true) {
    try {

      let car = useCache ? await this.redisService.zGet('cars', id) : null;
      if (car) return plainToInstance(Car, JSON.parse(car));
      else{
        const car: any = await this.carRepository
          .createQueryBuilder('cars')
          .leftJoinAndSelect('cars.brand', 'brand')
          .leftJoinAndSelect('cars.pickup_location', 'pickup_location')
          .leftJoinAndSelect('cars.dropoff_location', 'dropoff_location')
          .leftJoinAndSelect('cars.policies', 'policies')
          .leftJoinAndSelect('cars.images', 'images')
          .select([
            'cars.car_id',
            'cars.car_name',
            'cars.rental_price',
            'cars.minimum_rental_period',
            'cars.transmission',
            'cars.number_of_seats',
            'cars.engine_size',
            'cars.max_speed',
            'cars.diesel_capacity',
            'cars.body_type',
            'cars.created_at',
            'cars.updated_at',
            'cars.year',
            'cars.fuel_type',
            'brand.brand_id',
            'brand.brand_logo',
            'pickup_location.location_id',
            'pickup_location.address',
            'pickup_location.coordinates',
            'dropoff_location.location_id',
            'dropoff_location.address',
            'dropoff_location.coordinates',
            'policies.policies_text',
            'images.image_path',
          ])
          .where('cars.car_id = :id ', { id })
          .getOne();

        if (!car) throw new NotFoundException('Car not found.');

        car.brand.brand_logo = Helpers.getStaticFilePublicPath(
          car.brand.brand_logo,
        );
        car.images = car.images.map(item =>
          Helpers.getStaticFilePublicPath(item.image_path),
        );
        car.policies =
          car.policies.length > 0 ? car.policies[0].policies_text : null;

        await this.redisService.zadd('cars', car.car_id, JSON.stringify(car));
        return car;
      }
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException(error.message);
      throw new Error(error);
    }
  }

  /**
   * Updates a car's details.
   * Checks if brand and locations exist before updating.
   * @param id - Car ID.
   * @param updateCarDto - Data transfer object with updated car details.
   * @throws NotFoundException if car, brand, or location is not found.
   * @returns The updated car details.
   */
  async update(id: number, updateCarDto: UpdateCarDto) {
    try {
      await this.carRepository.findOneOrFail({
        where: { car_id: id },
        select: ['car_id'],
      });
      if (updateCarDto.brand_id)
        await this.brandRepository.findOneOrFail({
          where: { brand_id: updateCarDto.brand_id },
          select: ['brand_id'],
        });
      if (updateCarDto.pickup_location_id)
        await this.locationRepository.findOneOrFail({
          where: { location_id: updateCarDto.pickup_location_id },
          select: ['location_id'],
        });
      if (updateCarDto.dropoff_location_id)
        await this.locationRepository.findOneOrFail({
          where: { location_id: updateCarDto.dropoff_location_id },
          select: ['location_id'],
        });
      if (updateCarDto.rental_price)
        updateCarDto.rental_price =
          Math.floor(updateCarDto.rental_price * 100) / 100;

      await this.carRepository.update({ car_id: id }, updateCarDto);
      await this.redisService.zRemoveElementByScore('cars', id)
      return updateCarDto;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        if (error.message.includes('Car'))
          throw new NotFoundException('Car Not Found.');
        if (error.message.includes('Brand'))
          throw new NotFoundException('Brand Not Found.');
        if (error.message.includes('Location'))
          throw new NotFoundException('Location Not Found.');
      }
      throw new Error(error);
    }
  }

  /**
   * Updates car images for a specific car.
   * @param imagesName - Array of image file paths.
   * @param carId - Car ID.
   * @throws NotFoundException if the car is not found.
   */
  async updateCarImages(imagesName: string[], carId: number) {
    try {
      await this.carRepository.findOneOrFail({
        where: { car_id: carId },
        select: ['car_id'],
      });
      const carImages = imagesName.map(image => ({
        car_id: carId,
        image_path: image,
      }));
      await this.carImagesRepository.save(carImages);
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Car Not Found.');
      throw new Error(error);
    }
  }

  /**
   * Updates car policies by car ID.
   * Sets new policy text for the specified car.
   * @param policies - Text of the new car policies.
   * @param carId - The car ID for which policies are being updated.
   * @throws NotFoundException if the car is not found.
   */
  async updateCarPolicies(policies: string, carId: number) {
    try {
      await this.carRepository.findOneOrFail({
        where: { car_id: carId },
        select: ['car_id'],
      });
      await this.carPoliciesRepository.upsert(
        {
          policies_text: policies,
          car_id: carId,
        },
        ['car_id'],
      );
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Car Not Found.');
      throw new Error(error);
    }
  }

  /**
   * Marks a car as unavailable by setting its availability to false.
   * @param carId - The car ID to be marked unavailable.
   * @throws NotFoundException if the car is not found.
   */
  async remove(carId: number) {
    try {
      const car: Car = await this.carRepository.findOneOrFail({
        where: { car_id: carId },
        select: ['car_id'],
      });
      car.is_available = false;
      await this.carRepository.save(car);
      await this.redisService.zRemoveElementByScore('cars', carId)
    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Car Not Found.');
      throw new Error(error);
    }
  }
}
