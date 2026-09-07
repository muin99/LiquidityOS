import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Provider } from '../providers/provider.entity';

// An agent's physical cash box. Every agent has exactly ONE of these
// (that's why agentId is "unique" below) — it's not split per provider.
@Entity('cash_drawers')
export class CashDrawer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, nullable: true })
  agentId?: string;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'agentId' })
  agent: User;

  @Column({ unique: true, nullable: true })
  coordinatorId?: string;

  @OneToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'coordinatorId' })
  coordinator: User;

  // When this is filled, the drawer belongs to the provider reserve itself.
  @Column({ unique: true, nullable: true })
  providerId?: string;

  @OneToOne(() => Provider, { nullable: true })
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @Column({ type: 'numeric', precision: 14, scale: 2, default: 0 })
  balance: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
