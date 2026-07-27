import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('disputes')
export class Dispute {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid', { nullable: true }) requestId?: string;
  @Column('uuid', { nullable: true }) transferId?: string;
  @Column('uuid') openedBy: string;
  @Column('text') reason: string;
  @Column({ length: 20, default: 'open' }) status:
    'open' | 'under_review' | 'resolved' | 'rejected';
  @Column('text', { nullable: true }) resolutionNote?: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
