import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateCarPoliciesTable1730026511801 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the car_policies table
    await queryRunner.createTable(
      new Table({
        name: 'car_policies',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isNullable: false,
          },
          {
            name: 'car_id',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'policies_text',
            type: 'text',
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

    // Create foreign key for car_id
    await queryRunner.createForeignKey(
      'car_policies',
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
    const table = await queryRunner.getTable('car_policies');
    const foreignKey = table.foreignKeys.find(
      fk => fk.columnNames.indexOf('car_id') !== -1,
    );
    await queryRunner.dropForeignKey('car_policies', foreignKey);

    // Drop the car_policies table
    await queryRunner.dropTable('car_policies');
  }
}
