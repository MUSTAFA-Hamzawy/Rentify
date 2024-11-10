import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Car } from '../../cars/entities/car.entity';
import { User } from '../../users/entities/user.entity';

@Entity('car_reviews')
export class CarReview {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  review_id: number;

  @Column('text', { nullable: true })
  review_text: string;

  @Column('smallint', { nullable: true })
  review_rate: number;

  @Column('int', { nullable: true })
  car_id: number;

  @Column('bigint', { nullable: true })
  user_id: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @ManyToOne(() => Car, car => car.reviews, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'car_id' })
  car: Car;

  @ManyToOne(() => User, user => user.reviews, {
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
