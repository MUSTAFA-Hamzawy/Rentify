import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateDiscountsTable1730026511803 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the discounts table
    await queryRunner.createTable(
      new Table({
        name: 'discounts',
        columns: [
          {
            name: 'discount_id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isNullable: false,
          },
          {
            name: 'start_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'end_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'discount_percentage',
            type: 'smallint',
            isNullable: false,
            comment: 'Max value is 99',
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
      'discounts',
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
    const table = await queryRunner.getTable('discounts');
    const foreignKey = table.foreignKeys.find(
      fk => fk.columnNames.indexOf('car_id') !== -1,
    );
    await queryRunner.dropForeignKey('discounts', foreignKey);

    // Drop the discounts table
    await queryRunner.dropTable('discounts');
  }
}
