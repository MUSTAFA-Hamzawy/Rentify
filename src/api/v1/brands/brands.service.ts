import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Brand } from './entities/brand.entity';
import { Helpers } from '../../../common/helpers/helpers.class';
import { RedisService } from '../../../common/modules/redis/redis.service';
import { plainToInstance } from 'class-transformer';

/**
 * Service for managing brand-related operations.
 */
@Injectable()
export class BrandsService {
  constructor(
    @InjectRepository(Brand)
    private readonly brandRepository: Repository<Brand>,
    private readonly redisService: RedisService
  ) {}

  /**
   * Creates a new brand with the provided data and logo.
   * @param brandData An object containing the brand data and logo filename.
   * @returns The created brand.
   * @throws ConflictException if a brand with the same name already exists.
   */
  async create(brandData: {
    brandDto: CreateBrandDto;
    brand_logo: string;
  }): Promise<Brand> {
    try {
      let brand: Brand = new Brand();
      brand.brand_name = brandData.brandDto.brand_name.toLowerCase();
      brand.brand_logo = brandData.brand_logo;
      await this.brandRepository.save(brand);
      brand = await this.findOne(brand.brand_id);

      // add it to cache memory
      await this.redisService.zadd('brands', brand.brand_id, JSON.stringify(brand));

      return brand;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('Brand with this name already exists');
      }
      throw new Error(error);
    }
  }

  /**
   * Retrieves all brands with optional pagination.
   * @param page The page number for pagination (defaults to 1).
   * @param limit The number of brands to retrieve per page (defaults to 10).
   * @returns An array of brands.
   */
  async findAll(page: number = 1, limit: number = 10): Promise<Brand[]> {
    try {
      if (page <= 0 || limit <= 0)
        throw new BadRequestException('Invalid request params.');

      const cachedBrands = await this.redisService.zRange('brands', (page - 1) * limit, page * limit - 1);
      if (cachedBrands.length > 0) return cachedBrands.map((brand) => plainToInstance(Brand, JSON.parse(brand)));

      return await this.brandRepository.find({
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
   * Retrieves a single brand by its ID.
   * @param id The ID of the brand to retrieve.
   * @param useCache : a flag to determine whether we need to use cache memory or not.
   * @returns The requested brand.
   * @throws NotFoundException if the brand is not found.
   */
  async findOne(id: number, useCache: boolean = true): Promise<Brand> {
    try {
      const brand = useCache ? await this.redisService.zGet('brands', id) : null;
      if (brand) return plainToInstance(Brand, JSON.parse(brand));
      else{
        const brand: Brand = await this.brandRepository.findOneOrFail({
          where: { brand_id: id },
        });
        brand.brand_name = Helpers.UCFirst(brand.brand_name);
        brand.brand_logo = Helpers.getStaticFilePublicPath(brand.brand_logo);
        await this.redisService.zadd('brands', brand.brand_id, JSON.stringify(brand));
        return brand;
      }
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException('Brand is not found.');
      }
      throw new Error(error);
    }
  }

  /**
   * Updates an existing brand's details, optionally with a new logo.
   * @param brandData An object containing the updated brand data and logo filename (optional).
   * @returns The updated brand.
   * @throws ConflictException if a brand with the same name already exists.
   * @throws NotFoundException if the brand is not found.
   */
  async update(brandData: {
    updateDto: UpdateBrandDto;
    brand_logo?: string;
  }): Promise<Brand> {
    try {
      const brandOldData: Brand = await this.brandRepository.findOneByOrFail({
        brand_id: +brandData.updateDto.brand_id,
      });

      // removing the old logo
      if (brandData.brand_logo)
        await Helpers.removeFile(brandOldData.brand_logo);

      // update data
      const updateObj = {
        brand_name: brandData.updateDto.brand_name.toLowerCase(),
        brand_logo: brandData.brand_logo
          ? brandData.brand_logo
          : brandOldData.brand_logo,
      };

      await this.brandRepository.update(brandOldData.brand_id, updateObj);
      await this.redisService.zRemoveElementByScore('brands', brandOldData.brand_id);
      return await this.findOne(brandOldData.brand_id, false);
    } catch (error) {
      if (error.code === '23505')
        throw new ConflictException('Brand with this name already exists');
      if (error instanceof EntityNotFoundError)
        throw new NotFoundException('Brand not found.');

      throw new Error(error);
    }
  }

  /**
   * Deletes a brand by its ID.
   * @param id The ID of the brand to delete.
   * @throws NotFoundException if the brand is not found.
   */
  async remove(id: number): Promise<void> {
    try {
      await this.findOne(id);
      await this.brandRepository.delete(id);
      await this.redisService.zRemoveElementByScore('brands', id);
    } catch (error) {
      if (error instanceof NotFoundException)
        throw new NotFoundException('Brand is not found.');
      throw new Error(error);
    }
  }
}
