import { IsNotEmpty, IsString, IsNumber, Min } from "class-validator";

export class LiquidityCheckDto {
    @IsString()
    @IsNotEmpty()
    agentName: string;

    @IsNumber()
    @Min(0)
    availableCash: number;

    @IsNumber()
    @Min(1)
    requestedCash: number;

}