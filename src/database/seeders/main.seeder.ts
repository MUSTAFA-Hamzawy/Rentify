import { faker } from '@faker-js/faker';
import { DataSource } from 'typeorm';
import { Seeder, SeederFactoryManager } from 'typeorm-extension';

import { User } from '../../api/v1/users/entities/user.entity';

export class MainSeeder implements Seeder {
  private readonly USERS_COUNT: number = 100;

  public async run(
    dataSource: DataSource,
    factoryManager: SeederFactoryManager,
  ): Promise<any> {
    const userFactory = factoryManager.get(User);

    console.log('seeding users...');
    const users = await userFactory.saveMany(this.USERS_COUNT);
  }
}
