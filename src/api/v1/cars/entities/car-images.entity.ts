import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Car } from './car.entity';

@Entity('car_images')
export class CarImage {
  @PrimaryGeneratedColumn('increment', { name: 'image_id' })
  image_id: number;

  @Column({ type: 'varchar' })
  image_path: string;

  @Column({ type: 'int' })
  car_id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date | null;

  @ManyToOne(() => Car, car => car.images, {
    nullable: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'car_id' })
  car: Car;
}
