import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  ownerId: string;

  @Column({ length: 20 })
  ownerType: 'agent' | 'coordinator' | 'provider';

  @Column('uuid')
  providerId: string;

  @Column({ length: 20 })
  walletType: 'physical_cash' | 'e_money';

  @Column('bigint', { default: 0 })
  balance: string;

  @Column({ length: 20, default: 'active' })
  status: 'active' | 'frozen';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
