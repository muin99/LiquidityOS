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
import { Provider } from '../providers/provider.entity';

// Every human who can log in: an agent, a coordinator, a provider, or
// an admin. We use ONE table for all four and tell them apart with
// "role", instead of making a separate table for each one.
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

  // Only set when role is "provider" — which provider this account
  // represents. That's what lets a provider only decide applications
  // sent to their own provider, not anyone else's.
  @Column({ nullable: true })
  providerId: string;

  @ManyToOne(() => Provider, { nullable: true })
  @JoinColumn({ name: 'providerId' })
  provider: Provider;

  @CreateDateColumn()
  createdAt: Date;
}
