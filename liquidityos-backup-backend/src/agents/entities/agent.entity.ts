import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('agents')
export class Agent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { unique: true })
  userId: string;

  @Column('uuid')
  providerId: string;

  @Column('uuid')
  areaId: string;

  @Column({ length: 150 })
  shopName: string;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 20, default: 'active' })
  status: 'active' | 'suspended';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
