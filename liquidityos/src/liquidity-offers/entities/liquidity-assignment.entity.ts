import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('liquidity_assignments')
export class LiquidityAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  requestId: string;

  @Column('uuid', { unique: true })
  offerId: string;

  @Column('uuid')
  assignedTo: string;

  @Column('uuid')
  assignedBy: string;

  @Column('bigint')
  assignedAmount: string;

  @Column({ length: 20, default: 'active' })
  status: 'active' | 'completed' | 'cancelled';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
