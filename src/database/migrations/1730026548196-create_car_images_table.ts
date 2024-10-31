import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCarImagesTable1730026511800 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the car_images table
    await queryRunner.createTable(
      new Table({
        name: 'car_images',
        columns: [
          {
            name: 'image_id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isNullable: false,
          },
          {
            name: 'image_path',
            type: 'varchar',
            isNullable: false,
          },
          {
            name: 'car_id',
            type: 'int',
            isNullable: true,
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

    // Create foreign key for car_id
    await queryRunner.createForeignKey(
      'car_images',
      new TableForeignKey({
        columnNames: ['car_id'],
        referencedTableName: 'cars',
        referencedColumnNames: ['car_id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key first
    const table = await queryRunner.getTable('car_images');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('car_id') !== -1,
    );
    await queryRunner.dropForeignKey('car_images', foreignKey);

    // Drop the car_images table
    await queryRunner.dropTable('car_images');
  }
}
