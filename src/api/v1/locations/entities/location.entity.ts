import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface Coordinates {
  lat: number;
  long: number;
}

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn({ name: 'location_id' })
  location_id: number;

  @Column({ type: 'varchar', nullable: false, comment: 'Friendly location name like: Down Town' })
  address: string;

  @Column({ type: 'jsonb', nullable: false })
  coordinates: Coordinates;

  @Column({
    type: 'enum',
    enum: ['pickup', 'drop_off'],
    nullable: false,
  })
  location_type: 'pickup' | 'drop_off';

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: Date | null;
}