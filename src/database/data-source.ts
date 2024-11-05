import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

import { SRC_PATH } from '../config/app.config';
import { join } from 'path';
import { SeederOptions } from 'typeorm-extension';
import { MainSeeder } from './seeders/main.seeder';
import { UserFactory } from './seeders/users.factory';
import { User } from '../api/v1/users/entities/user.entity';
import { TokenBlackList } from '../api/v1/users/entities/token-blacklist.entity';
import { Brand } from '../api/v1/brands/entities/brand.entity';
import { BrandFactory } from './seeders/brands.factory';
import { Location } from '../api/v1/locations/entities/location.entity';
import { LocationFactory } from './seeders/locations.factory';
import { ContactUs } from '../api/v1/contact-us/entities/contact-us.entity';
import * as process from 'node:process';
config();
const dbConfigFile = join(SRC_PATH, 'database', 'db.config.json');

const env = process.env.NODE_ENV || 'development';
const dbConfig = require(dbConfigFile)[env];

// Create a DataSource configuration
export const dataSourceOptions: DataSourceOptions & SeederOptions = {
  type: dbConfig.type,
  host: dbConfig.host || 'localhost',
  port: +dbConfig.port || 5432,
  username: dbConfig.username,
  password: dbConfig.password,
  database: dbConfig.database,
  migrations: ['dist/database/migrations/**/*.js'],
  entities: [User, TokenBlackList, Brand, Location, ContactUs],
  factories: [UserFactory, BrandFactory, LocationFactory],
  seeds: [MainSeeder],
  logging: process.env.NODE_ENV === 'development',
};

export const AppDataSource = new DataSource(dataSourceOptions);
