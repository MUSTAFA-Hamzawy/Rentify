import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate
} from 'typeorm';
import { Factory } from "nestjs-seeder";

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

  @Column({ type: 'varchar', length: 15, nullable: true })
  phone_number: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  otp_secret_key: string;


  @Column({ type: 'boolean', default: false })
  is_admin: boolean;

  @Column({ type: 'boolean', default: false })
  is_blocked: boolean;

  @Column({ type: 'boolean', default: false })
  account_disabled: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updated_at = new Date();
  }

  // @OneToMany(() => Contact, contact => contact.user)
  // contactMessages: Contact[];

  // @OneToOne(() => Order, order => order.user)
  // order: Order;

  // @ManyToMany(() => PaymentMethod, paymentMethod => paymentMethod.users)
  // @JoinTable({
  //     name: 'user_payment_methods',
  //     joinColumn: { name: 'user_id', referencedColumnName: 'user_id' },
  //     inverseJoinColumn: { name: 'method_id', referencedColumnName: 'id' }
  // })
  // paymentMethods: PaymentMethod[];
}
