import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateOrdersTable1740026569529 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'order_id',
            type: 'bigint',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
            isNullable: false,
          },
          {
            name: 'order_status',
            type: 'enum',
            enum: [
              'pending',
              'in_progress',
              'confirmed',
              'completed',
              'canceled',
            ],
            isNullable: false,
          },
          {
            name: 'user_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'car_id',
            type: 'int',
            isNullable: false,
          },
          {
            name: 'pickup_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'dropoff_date',
            type: 'timestamp',
            isNullable: false,
          },
          {
            name: 'total_price',
            type: 'decimal',
            precision: 15,
            scale: 2,
            isNullable: false,
          },
          {
            name: 'payment_state',
            type: 'varchar',
            isNullable: false,
            comment: 'pending, completed, failed',
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

    // Create foreign keys for user_id and car_id
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['user_id'],
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      }),
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['car_id'],
        referencedTableName: 'cars',
        referencedColumnNames: ['car_id'],
        onUpdate: 'CASCADE',
        onDelete: 'NO ACTION',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const table = await queryRunner.getTable('orders');
    const foreignKeys = table.foreignKeys;

    for (const foreignKey of foreignKeys) {
      if (
        foreignKey.columnNames.includes('user_id') ||
        foreignKey.columnNames.includes('car_id')
      ) {
        await queryRunner.dropForeignKey('orders', foreignKey);
      }
    }

    // Drop the orders table
    await queryRunner.dropTable('orders');
  }
}
