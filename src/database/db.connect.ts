import { DataSource, DataSourceOptions } from 'typeorm';
import * as path from 'path';

import { dataSourceOptions } from './data-source';

// Connect to db
const AppDataSource = new DataSource(dataSourceOptions);
const connectToDB = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log(
      'Connection to the database has been established successfully.',
    );
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    throw error;
  }
};

// Function to close the database connection
const closeDBConnection = async (): Promise<void> => {
  try {
    await AppDataSource.destroy();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error closing database connection:', error.message);
  }
};

export { connectToDB, AppDataSource, closeDBConnection };
