import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Car } from '../../cars/entities/car.entity';

@Entity('brands')
export class Brand {
  @PrimaryGeneratedColumn({ name: 'brand_id' })
  brand_id: number;

  @Column({ type: 'varchar', unique: true, nullable: false })
  brand_name: string;

  @Column({ type: 'varchar', nullable: false })
  brand_logo: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @OneToMany(() => Car, car => car.brand_id)
  cars: Car[];
}
