import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('liquidity_requests')
export class LiquidityRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  requesterId: string;

  @Column({ length: 20 })
  requesterType: 'agent' | 'coordinator';

  @Column({ length: 20 })
  liquidityType: 'physical_cash' | 'e_money';

  @Column('uuid')
  providerId: string;

  @Column('uuid')
  areaId: string;

  @Column('bigint')
  amount: string;

  @Column({ length: 20 })
  urgency: 'low' | 'medium' | 'high';

  @Column({ length: 20, default: 'open' })
  status: string;

  @Column({ default: false })
  allowPartial: boolean;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
