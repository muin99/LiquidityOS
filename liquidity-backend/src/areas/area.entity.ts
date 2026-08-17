import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// A place, like "Dhaka North" or "Chittagong Port".
// Agents and coordinators belong to an area so we can match them up
// by location — that's the whole point of this app.
@Entity('areas')
export class Area {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  region: string;
}
