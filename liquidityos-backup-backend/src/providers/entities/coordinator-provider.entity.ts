import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity('coordinator_providers')
@Unique(['coordinatorId', 'providerId'])
export class CoordinatorProvider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  coordinatorId: string;

  @Column('uuid')
  providerId: string;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status: 'pending' | 'approved' | 'rejected';

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @Column({ type: 'text', nullable: true })
  note?: string;

  @CreateDateColumn()
  createdAt: Date;
}
