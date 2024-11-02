import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';

import { SRC_PATH } from '../config/app.config';
import { join } from 'path';
import { SeederOptions } from 'typeorm-extension';
import { MainSeeder } from './seeders/main.seeder';
import { UserFactory } from './seeders/users.factory';
import { User } from '../api/v1/users/entities/user.entity';
import { TokenBlackList } from '../api/v1/users/entities/token-blacklist.entity';
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
  entities: [User, TokenBlackList],
  factories: [UserFactory],
  seeds: [MainSeeder],
};

export const AppDataSource = new DataSource(dataSourceOptions);
