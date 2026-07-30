import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('balance_snapshots')
export class BalanceSnapshot {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('uuid')
    agentId: string;

    @Column('bigint')
    cashBalance: string;

    @Column('bigint')
    eMoneyBalance: string;
    
    @Column({type: 'timestamp'})
    recordedAt: Date;
    
    @CreateDateColumn()
    createdAt: Date;
    
}
