import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('point_transactions')
export class PointTransaction {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') userId: string;
  @Column('uuid', { nullable: true }) transferId?: string;
  @Column({ length: 20 }) activityType: 'earned' | 'reversed' | 'redeemed';
  @Column('int') points: number;
  @Column('bigint', { nullable: true }) amount?: string;
  @CreateDateColumn() createdAt: Date;
}
