import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { User } from '../../api/v1/users/entities/user.entity';
import { Brand } from '../../api/v1/brands/entities/brand.entity';
import { Location } from '../../api/v1/locations/entities/location.entity';

export class MainSeeder implements Seeder {
  private readonly USERS_COUNT: number  = 100;
  private readonly BRANDS_COUNT: number = 10;
  private readonly LOCATIONS_COUNT: number = 10;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    // users
    const userFactory = factoryManager.get(User);

    console.log('seeding users...');
    await userFactory.saveMany(this.USERS_COUNT);

    // brands
    const brandFactory = factoryManager.get(Brand);

    console.log('seeding brands...');
    await brandFactory.saveMany(this.BRANDS_COUNT);

    // locations
    const locationFactory = factoryManager.get(Location);

    console.log('seeding locations...');
    await locationFactory.saveMany(this.LOCATIONS_COUNT);
  }
}
