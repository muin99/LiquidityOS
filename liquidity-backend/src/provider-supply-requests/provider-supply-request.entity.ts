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
import { RequestType } from '../common/enums/request-type.enum';
import { RequestStatus } from '../common/enums/request-status.enum';

// A coordinator asks a provider to refill cash or e-cash reserves.
@Entity('provider_supply_requests')
export class ProviderSupplyRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  coordinatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'coordinatorId' })
  coordinator: User;

  @Column()
  providerId: string;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @Column({ type: 'enum', enum: RequestType })
  type: RequestType;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: number;

  @Column({ type: 'enum', enum: RequestStatus, default: RequestStatus.PENDING })
  status: RequestStatus;

  @CreateDateColumn()
  requestedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  fulfilledAt: Date;
}
