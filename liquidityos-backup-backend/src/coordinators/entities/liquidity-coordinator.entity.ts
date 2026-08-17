import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('liquidity_coordinators')
export class LiquidityCoordinator {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @Column('uuid')
  areaId: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 20, default: 'active' })
  status: 'active' | 'suspended';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
