import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

// An agent's physical cash box. Every agent has exactly ONE of these
// (that's why agentId is "unique" below) — it's not split per provider.
@Entity('cash_drawers')
export class CashDrawer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  agentId: string;

  @OneToOne(() => User)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  balance: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
