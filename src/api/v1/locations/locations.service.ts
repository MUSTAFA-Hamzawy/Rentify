import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { Location } from './entities/location.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';

@Injectable()
export class LocationsService {

  constructor(@InjectRepository(Location) private readonly locationsRepository: Repository<Location>) {
  }

  async create(createLocationDto: CreateLocationDto) {
    try {
      return await this.locationsRepository.save({
        coordinates: createLocationDto.coordinates,
        address: createLocationDto.address,
        location_type: createLocationDto.location_type,
      });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    try {
      return await this.locationsRepository.find({ skip: (page - 1) * limit, take: limit });
    } catch (error) {
      throw new Error(error);
    }
  }

  async findOne(id: number) {
    try {
      return await this.locationsRepository.findOneByOrFail({location_id: id});
    } catch (error) {
      if (error instanceof EntityNotFoundError) throw new NotFoundException('Brand not found.');
      throw new Error(error);
    }
  }

  async update(id: number, updateLocationDto: UpdateLocationDto) {
    try {
      const location: Location = await this.findOne(id);
      location.address = updateLocationDto.address ? updateLocationDto.address : location.address;
      location.coordinates = updateLocationDto.coordinates ? updateLocationDto.coordinates : location.coordinates;
      location.location_type = updateLocationDto.location_type ? updateLocationDto.location_type : location.location_type;
      await this.locationsRepository.update(id, location);
      location.updated_at = new Date();
      return location;
    } catch (error) {
      if (error instanceof NotFoundException) throw new NotFoundException('Location is not found.');
      throw new Error(error);
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);
      await this.locationsRepository.delete(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw new NotFoundException('Location is not found.');
      throw new Error(error);
    }
  }
}
