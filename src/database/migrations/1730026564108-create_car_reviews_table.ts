import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCarReviewsTable1730026511802 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the car_reviews table
    await queryRunner.createTable(
      new Table({
        name: 'car_reviews',
        columns: [
          {
            name: 'review_id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isNullable: false,
          },
          {
            name: 'review_text',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'review_rate',
            type: 'smallint',
            isNullable: false,
          },
          {
            name: 'car_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'user_id',
            type: 'bigint',
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

    // Create foreign keys for car_id and user_id
    await queryRunner.createForeignKey(
      'car_reviews',
      new TableForeignKey({
        columnNames: ['car_id'],
        referencedTableName: 'cars',
        referencedColumnNames: ['car_id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'car_reviews',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['user_id'],
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const table = await queryRunner.getTable('car_reviews');
    const foreignKeys = table.foreignKeys;

    for (const foreignKey of foreignKeys) {
      if (
        foreignKey.columnNames.includes('car_id') ||
        foreignKey.columnNames.includes('user_id')
      ) {
        await queryRunner.dropForeignKey('car_reviews', foreignKey);
      }
    }

    // Drop the car_reviews table
    await queryRunner.dropTable('car_reviews');
  }
}
