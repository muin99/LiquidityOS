import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Provider } from '../providers/provider.entity';
import { TransactionType } from '../common/enums/transaction-type.enum';

// This is the "ledger book". Every time cash moves between a drawer
// and a wallet, we write ONE row here. We never just change a balance
// and forget about it — this way we can always prove what happened.
@Entity('cash_transactions')
export class CashTransaction {
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

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  drawerBalanceAfter: number;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  walletBalanceAfter: number;

  @CreateDateColumn()
  createdAt: Date;
}
