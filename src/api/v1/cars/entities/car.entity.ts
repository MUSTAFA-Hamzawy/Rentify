import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Brand } from '../../brands/entities/brand.entity';
import { Location } from '../../locations/entities/location.entity';
import { CarPolicy } from './car-policies.entity';
import { CarImage } from './car-images.entity';
import { CarReview } from '../../car-reviews/entities/car-review.entity';

@Entity('cars')
export class Car {
  @PrimaryGeneratedColumn()
  car_id: number;

  @Column({ type: 'int', nullable: true })
  brand_id: number;

  @Column({ type: 'varchar', nullable: false })
  car_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: false })
  rental_price: number;

  @Column({
    type: 'smallint',
    nullable: false,
    comment: 'Minimum number of days to rent the car',
  })
  minimum_rental_period: number;

  @Column({ type: 'int', nullable: true })
  pickup_location_id: number;

  @Column({ type: 'int', nullable: true })
  dropoff_location_id: number;

  @Column({
    type: 'enum',
    enum: ['automatic', 'manual'],
    nullable: false,
  })
  transmission: 'automatic' | 'manual';

  @Column({ type: 'smallint', nullable: false })
  number_of_seats: number;

  @Column({ type: 'boolean', default: false })
  is_available: boolean;

  @Column({ type: 'int', nullable: false })
  engine_size: number;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: false,
    comment: 'KM per hour',
  })
  max_speed: number;

  @Column({ type: 'int', nullable: false, comment: 'in Liter' })
  diesel_capacity: number;

  @Column({ type: 'varchar', nullable: false })
  body_type: string;

  @Column({ type: 'smallint', nullable: false })
  year: number;

  @Column({
    type: 'enum',
    enum: ['petrol', 'diesel'],
    nullable: false,
  })
  fuel_type: 'petrol' | 'diesel';

  @CreateDateColumn({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ nullable: true })
  updated_at: Date;

  @ManyToOne(() => Brand, brand => brand.cars, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'brand_id' })
  brand: Brand;

  @ManyToOne(() => Location, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'pickup_location_id' })
  pickup_location: Location;

  @ManyToOne(() => Location, {
    nullable: true,
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'dropoff_location_id' })
  dropoff_location: Location;

  @OneToMany(() => CarPolicy, policy => policy.car)
  policies: CarPolicy[];

  @OneToMany(() => CarImage, image => image.car)
  images: CarImage[];

  @OneToMany(() => CarReview, review => review.car)
  reviews: CarReview[];
}
