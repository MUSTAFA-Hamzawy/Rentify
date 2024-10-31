import { MigrationInterface, QueryRunner, Table, TableColumn } from 'typeorm';

export class CreateLocationsTable1730026511797 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'locations',
        columns: [
          {
            name: 'location_id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isNullable: false,
          },
          {
            name: 'address',
            type: 'varchar',
            isNullable: false,
            comment: 'Friendly location name like: Down Town',
          },
          {
            name: 'coordinates',
            type: 'jsonb',
            isNullable: false,
          },
          {
            name: 'location_type',
            type: 'enum',
            enum: ['pickup', 'drop_off'],
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('locations');
  }
}
