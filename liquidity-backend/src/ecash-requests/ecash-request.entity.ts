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
import { RequestStatus } from '../common/enums/request-status.enum';
import { RequestType } from '../common/enums/request-type.enum';

// An agent's SOS: "my e-cash wallet is running low, please top me up".
// coordinatorId stays empty until someone picks up the request.
@Entity('ecash_requests')
export class EcashRequest {
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

  @Column({ nullable: true })
  coordinatorId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'coordinatorId' })
  coordinator: User;

  @Column({ type: 'numeric', precision: 14, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: RequestType,
    default: RequestType.E_CASH,
  })
  type: RequestType;

  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @CreateDateColumn()
  requestedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  fulfilledAt: Date;
}
