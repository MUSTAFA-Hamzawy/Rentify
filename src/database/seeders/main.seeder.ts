import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';
import * as bcrypt from 'bcrypt';
import { User } from '../../api/v1/users/entities/user.entity';
import { Brand } from '../../api/v1/brands/entities/brand.entity';
import { Location } from '../../api/v1/locations/entities/location.entity';
import { Car } from '../../api/v1/cars/entities/car.entity';
import { CarImage } from '../../api/v1/cars/entities/car-images.entity';

export class MainSeeder implements Seeder {
  private readonly USERS_COUNT: number = 100;
  private readonly BRANDS_COUNT: number = 10;
  private readonly LOCATIONS_COUNT: number = 10;
  private readonly CARS_COUNT: number = 20;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    // users
    const userFactory = factoryManager.get(User);
    console.log('seeding users...');
    await userFactory.saveMany(this.USERS_COUNT);

    // admin
    console.log('Seeding admin...');
    await dataSource.getRepository(User).save({
      full_name: 'Admin Account',
      email: 'admin@gmail.com',
      preferred_currency: 'USD',
      password: await bcrypt.hash(
        'Open@@1234',
        parseInt(process.env.PASSWORD_HASH_SALT_ROUND),
      ),
      phone_number: '201121366555',
      is_admin: true,
      verification_status: true,
    });

    // brands
    const brandFactory = factoryManager.get(Brand);
    console.log('seeding brands...');
    await brandFactory.saveMany(this.BRANDS_COUNT);

    // locations
    const locationFactory = factoryManager.get(Location);
    console.log('seeding locations...');
    await locationFactory.saveMany(this.LOCATIONS_COUNT);

    // cars
    const carFactory = factoryManager.get(Car);
    console.log('seeding cars...');
    await carFactory.saveMany(this.CARS_COUNT);

    // cars
    const carImage = factoryManager.get(CarImage);
    console.log('seeding cars images...');
    await carImage.saveMany(this.CARS_COUNT);
  }
}
