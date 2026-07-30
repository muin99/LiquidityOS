import { IsDateString, IsInt, isNumber, IsNumber, IsUUID, Min } from "class-validator";

export class CreateBalanceSnapshotDto {
    @IsUUID()
    agentId: string;

    @IsNumber()
    @IsInt()
    @Min(0)
    cashBalance: number;

    @IsInt()
    @Min(0)
    @IsNumber()
    eMoneyBalance: number;

    @IsDateString()
    recordedAt: string;
}
