import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { RedisService } from '../../../common/modules/redis/redis.service';
import { plainToInstance } from 'class-transformer';
import { Brand } from '../brands/entities/brand.entity';

/**
 * Service for managing locations.
 * This service provides methods to create, retrieve, update, and delete location records.
 */
@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Location)
    private readonly locationsRepository: Repository<Location>,
    private redisService: RedisService,
  ) {}

  /**
   * Creates a new location.
   * @param createLocationDto - The data transfer object containing location details.
   * @returns The created Location entity.
   * @throws Error if creation fails.
   */
  async create(createLocationDto: CreateLocationDto): Promise<Location> {
    try {
      const location = await this.locationsRepository.save({
        coordinates: createLocationDto.coordinates,
        address: createLocationDto.address,
        location_type: createLocationDto.location_type,
      });

      // add it to cache memory
      await this.redisService.zadd('locations', location.location_id, JSON.stringify(location));

      return location;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Retrieves all locations with pagination.
   * @param page - The page number for pagination (default is 1).
   * @param limit - The number of locations to retrieve per page (default is 10).
   * @returns An array of Location entities.
   * @throws Error if retrieval fails.
   */
  async findAll(page: number = 1, limit: number = 10): Promise<Location[]> {
    try {
      if (page <= 0 || limit <= 0)
        throw new BadRequestException('Invalid request params.');

      const cachedLocations = await this.redisService.zRange('locations', (page - 1) * limit, page * limit - 1);
      if (cachedLocations.length > 0) return cachedLocations.map((location) => plainToInstance(Location, JSON.parse(location)));

      return await this.locationsRepository.find({
        skip: (page - 1) * limit,
        take: limit,
      });
    } catch (error) {
      if (error instanceof BadRequestException)
        throw new BadRequestException(error.message);
      throw new Error(error);
    }
  }

  /**
   * Retrieves a single location by its ID.
   * @param id - The ID of the location to retrieve.
   * @param useCache : a flag to determine whether we need to use cache memory or not.
   * @returns The Location entity.
   * @throws NotFoundException if the location is not found.
   * @throws Error if retrieval fails for other reasons.
   */
  async findOne(id: number, useCache: boolean = true): Promise<Location> {
    try {
      const location = useCache ? await this.redisService.zGet('locations', id) : null;
      if (location) return plainToInstance(Location, JSON.parse(location));
      else{
        const location: Location = await this.locationsRepository.findOneByOrFail({
          location_id: id,
        });
        await this.redisService.zadd('locations', location.location_id, JSON.stringify(location));
        return location;
      }


    } catch (error) {
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Brand not found.');
      throw new Error(error);
    }
  }

  /**
   * Updates an existing location.
   * @param id - The ID of the location to update.
   * @param updateLocationDto - The data transfer object containing updated location details.
   * @returns The updated Location entity.
   * @throws NotFoundException if the location is not found.
   * @throws Error if update fails for other reasons.
   */
  async update(
    id: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<Location> {
    try {
      const location: Location = await this.findOne(id);
      location.address = updateLocationDto.address
        ? updateLocationDto.address
        : location.address;
      location.coordinates = updateLocationDto.coordinates
        ? updateLocationDto.coordinates
        : location.coordinates;
      location.location_type = updateLocationDto.location_type
        ? updateLocationDto.location_type
        : location.location_type;
      await this.locationsRepository.update(id, location);
      location.updated_at = new Date();
      await this.redisService.zUpdateByScore('locations', location.location_id, JSON.stringify(location))
      return location;
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException('Location is not found.');
      throw new Error(error);
    }
  }

  /**
   * Deletes a location by its ID.
   * @param id - The ID of the location to delete.
   * @throws NotFoundException if the location is not found.
   * @throws Error if deletion fails for other reasons.
   */
  async remove(id: number): Promise<void> {
    try {
      await this.findOne(id);
      await this.locationsRepository.delete(id);
      await this.redisService.zRemoveElementByScore('locations', id);
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException('Location is not found.');
      throw new Error(error);
    }
  }
}
