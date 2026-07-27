import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('liquidity_offers')
export class LiquidityOffer {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') requestId: string;
  @Column('uuid') coordinatorId: string;
  @Column('bigint') availableAmount: string;
  @Column('int') etaMinutes: number;
  @Column({ type: 'text', nullable: true }) note?: string;
  @Column({ length: 20, default: 'submitted' }) status:
    'submitted' | 'withdrawn' | 'accepted' | 'rejected';
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
