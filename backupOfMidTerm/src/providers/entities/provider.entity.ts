import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    length: 150,
  })
  name: string;

  @Column({
    unique: true,
    length: 30,
  })
  tenant_code: string;

  @Column('uuid', { unique: true, nullable: true })
  ownerUserId?: string;

  @Column({ length: 120, nullable: true })
  contact_name?: string;

  @Column({ length: 150, nullable: true })
  contact_email?: string;

  @Column({ length: 20, nullable: true })
  contact_phone?: string;

  @Column({ type: 'text', nullable: true })
  onboarding_note?: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending',
  })
  status: 'pending' | 'approved' | 'rejected' | 'suspended';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
