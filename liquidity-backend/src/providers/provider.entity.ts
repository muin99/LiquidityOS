import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// A mobile-money / bank network, like "bKash" or "Nagad".
// Agents cash e-money in and out for a provider, and coordinators
// apply to become the ones who top up agents for that provider.
@Entity('providers')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ default: true })
  isActive: boolean;
}
