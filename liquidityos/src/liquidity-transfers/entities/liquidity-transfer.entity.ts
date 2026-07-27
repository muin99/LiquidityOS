import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('liquidity_transfers')
export class LiquidityTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  fromWalletId: string;

  @Column('uuid')
  toWalletId: string;

  @Column('bigint')
  amount: string;

  @Column({ length: 30 })
  transferType: string;

  @Column({ length: 64, unique: true })
  idempotencyKey: string;

  @Column({ length: 20, default: 'success' })
  status: 'pending' | 'success' | 'failed' | 'reversed';

  @Column({ type: 'timestamp', nullable: true })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
