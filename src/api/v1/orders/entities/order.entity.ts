import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Car } from '../../cars/entities/car.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  order_id: number;

  @Column({
    type: 'enum',
    enum: ['pending', 'in_progress', 'confirmed', 'completed', 'canceled'],
  })
  order_status:
    | 'pending'
    | 'in_progress'
    | 'confirmed'
    | 'completed'
    | 'canceled';

  @Column({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'int' })
  car_id: number;

  @Column({ type: 'timestamp' })
  pickup_date: Date;

  @Column({ type: 'timestamp' })
  dropoff_date: Date;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_price: number;

  @Column({ type: 'varchar', comment: 'pending, completed, failed' })
  payment_state: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    nullable: true,
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @ManyToOne(() => User, user => user.orders, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Car, car => car.orders, { onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'car_id' })
  car: Car;
}
