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
@Unique(['coordinatorId', 'providerId'])
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  agentId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column({ nullable: true })
  coordinatorId?: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'coordinatorId' })
  coordinator: User;

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
