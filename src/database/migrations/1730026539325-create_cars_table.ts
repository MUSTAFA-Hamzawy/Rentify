import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCarsTable1730026511799 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the cars table
    await queryRunner.createTable(
      new Table({
        name: 'cars',
        columns: [
          {
            name: 'car_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isNullable: false,
          },
          {
            name: 'brand_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'car_name',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'rental_price',
            type: 'decimal',
            precision: 10,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'minimum_rental_period',
            type: 'smallint',
            isNullable: false,
            comment: 'Minimum number of days to rent the car',
          },
          {
            name: 'pickup_location_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'dropoff_location_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'transmission',
            type: 'enum',
            enum: ['automatic', 'manual'],
            isNullable: false,
          },
          {
            name: 'number_of_seats',
            type: 'smallint',
            isNullable: false,
          },
          {
            name: 'is_available',
            type: 'boolean',
            default: false,
          },
          {
            name: 'engine_size',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'max_speed',
            type: 'decimal',
            precision: 5,
            scale: 2,
            isNullable: false,
            comment: 'KM per hour',
          },
          {
            name: 'diesel_capacity',
            type: 'int',
            isNullable: false,
            comment: 'in Liter',
          },
          {
            name: 'body_type',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'year',
            type: 'smallint',
            isNullable: false,
          },
          {
            name: 'fuel_type',
            type: 'enum',
            enum: ['petrol', 'diesel'],
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
    );

    // Create foreign keys for brand_id, pickup_location_id, and dropoff_location_id
    await queryRunner.createForeignKey(
      'cars',
      new TableForeignKey({
        columnNames: ['brand_id'],
        referencedTableName: 'brands',
        referencedColumnNames: ['brand_id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'cars',
      new TableForeignKey({
        columnNames: ['pickup_location_id'],
        referencedTableName: 'locations',
        referencedColumnNames: ['location_id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );

    await queryRunner.createForeignKey(
      'cars',
      new TableForeignKey({
        columnNames: ['dropoff_location_id'],
        referencedTableName: 'locations',
        referencedColumnNames: ['location_id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const table = await queryRunner.getTable('cars');
    const foreignKeys = table.foreignKeys;

    for (const foreignKey of foreignKeys) {
      if (
        foreignKey.columnNames.includes('brand_id') ||
        foreignKey.columnNames.includes('pickup_location_id') ||
        foreignKey.columnNames.includes('dropoff_location_id')
      ) {
        await queryRunner.dropForeignKey('cars', foreignKey);
      }
    }

    // Drop the cars table
    await queryRunner.dropTable('cars');
  }
}
