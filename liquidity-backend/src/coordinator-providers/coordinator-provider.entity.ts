import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from "typeorm";
import { User } from "../users/user.entity";
import { Provider } from "../providers/provider.entity";
import { ApplicationStatus } from "../common/enums/application-status.enum";

// This is BOTH the application AND the ongoing relationship.
// A coordinator applies to a provider -> row is created as "pending".
// The provider (or admin) accepts/rejects -> same row's status changes.
// One coordinator can apply to many providers (one row each).
@Entity("coordinator_providers")
@Unique(["coordinatorId", "providerId"])
export class CoordinatorProvider {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  coordinatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "coordinatorId" })
  coordinator: User;

  @Column()
  providerId: string;

  @ManyToOne(() => Provider)
  @JoinColumn({ name: "providerId" })
  provider: Provider;

  @Column({
    type: "enum",
    enum: ApplicationStatus,
    default: ApplicationStatus.PENDING,
  })
  status: ApplicationStatus;

  @CreateDateColumn()
  appliedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  decidedAt: Date;
}
