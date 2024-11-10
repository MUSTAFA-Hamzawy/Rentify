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

  // @OneToOne(() => Order, order => order.user)
  // order: Order;

  @OneToMany(() => CarReview, review => review.user)
  reviews: CarReview[];

  // @ManyToMany(() => PaymentMethod, paymentMethod => paymentMethod.users)
  // @JoinTable({
  //     name: 'user_payment_methods',
  //     joinColumn: { name: 'user_id', referencedColumnName: 'user_id' },
  //     inverseJoinColumn: { name: 'method_id', referencedColumnName: 'id' }
  // })
  // paymentMethods: PaymentMethod[];
}
