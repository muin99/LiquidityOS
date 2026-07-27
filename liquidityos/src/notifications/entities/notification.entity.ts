import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column('uuid') userId: string;
  @Column({ length: 50 }) type: string;
  @Column({ type: 'jsonb', default: {} }) payload: Record<string, unknown>;
  @Column({ type: 'timestamp', nullable: true }) readAt?: Date;
  @Column({ length: 20, default: 'sent' }) status: 'pending' | 'sent' | 'read';
  @CreateDateColumn() createdAt: Date;
}
