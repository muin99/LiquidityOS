import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { UserRole } from '../common/enums/user-role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { Area } from '../areas/area.entity';

// Every human who can log in: an agent, a coordinator, or an admin.
// We use ONE table for all three and tell them apart with "role",
// instead of making a separate table for each one.
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  // "Exclude" means: never send this field back in an API response.
  @Exclude()
  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole;

  // Everyone starts PENDING until an admin approves them.
  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ nullable: true })
  areaId: string;

  @ManyToOne(() => Area, { nullable: true })
  @JoinColumn({ name: 'areaId' })
  area: Area;

  @CreateDateColumn()
  createdAt: Date;
}
