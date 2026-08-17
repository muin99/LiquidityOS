import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Provider } from '../providers/provider.entity';

// An agent's e-cash balance FOR ONE PROVIDER.
// An agent can have many wallets (one per provider they picked),
// but only ever one wallet per (agent, provider) pair — see @Unique below.
// The agent can never edit "balance" directly, only through cash_transactions.
@Entity('wallets')
@Unique(['agentId', 'providerId'])
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  agentId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column()
  providerId: string;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  balance: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
