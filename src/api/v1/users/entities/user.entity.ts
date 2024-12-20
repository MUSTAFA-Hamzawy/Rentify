import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  OneToMany,
} from 'typeorm';
import { Factory } from 'nestjs-seeder';
import { ContactUs } from '../../contact-us/entities/contact-us.entity';
import { CarReview } from '../../car-reviews/entities/car-review.entity';
import { Order } from '../../orders/entities/order.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  user_id: number;

  @Column({ type: 'varchar', nullable: true })
  image: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ type: 'varchar' })
  full_name: string;

  @Column({ type: 'boolean', default: false })
  verification_status: boolean;

  @Column({ type: 'varchar' })
  preferred_currency: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  phone_number: string;

  @Column({ type: 'varchar', nullable: true })
  otp_secret_key: string;

  @Column({ type: 'boolean', default: false })
  is_admin: boolean;

  @Column({ type: 'boolean', default: false })
  is_blocked: boolean;

  @Column({ type: 'boolean', default: false })
  account_disabled: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date;

  @OneToMany(() => ContactUs, contact => contact.user)
  contactMessages: ContactUs[];

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @OneToMany(() => CarReview, review => review.user)
  reviews: CarReview[];
}
