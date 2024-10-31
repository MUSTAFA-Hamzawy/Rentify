import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreateUserPaymentMethodsTable1730026511804
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the user_payment_methods table
    await queryRunner.createTable(
      new Table({
        name: 'user_payment_methods',
        columns: [
          {
            name: 'user_id',
            type: 'bigint',
            isNullable: false,
          },
          {
            name: 'method_id',
            type: 'int',
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

    // Create foreign keys for user_id and method_id
    await queryRunner.createForeignKey(
      'user_payment_methods',
      new TableForeignKey({
        columnNames: ['user_id'],
        referencedTableName: 'users',
        referencedColumnNames: ['user_id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'user_payment_methods',
      new TableForeignKey({
        columnNames: ['method_id'],
        referencedTableName: 'payment_methods',
        referencedColumnNames: ['method_id'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );

    // Add composite primary key
    await queryRunner.createPrimaryKey('user_payment_methods', [
      'user_id',
      'method_id',
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign keys first
    const table = await queryRunner.getTable('user_payment_methods');
    const foreignKeys = table.foreignKeys;

    for (const foreignKey of foreignKeys) {
      if (
        foreignKey.columnNames.includes('user_id') ||
        foreignKey.columnNames.includes('method_id')
      ) {
        await queryRunner.dropForeignKey('user_payment_methods', foreignKey);
      }
    }

    // Drop the user_payment_methods table
    await queryRunner.dropTable('user_payment_methods');
  }
}
