import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateTokenBlackListTable1730026511805
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the token_black_list table
    await queryRunner.createTable(
      new Table({
        name: 'token_black_list',
        columns: [
          {
            name: 'token',
            type: 'varchar',
            isPrimary: true,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop the token_black_list table
    await queryRunner.dropTable('token_black_list');
  }
}
