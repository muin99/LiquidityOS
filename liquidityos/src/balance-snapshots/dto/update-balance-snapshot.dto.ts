import { PartialType } from '@nestjs/swagger';
import { CreateBalanceSnapshotDto } from './create-balance-snapshot.dto';

export class UpdateBalanceSnapshotDto extends PartialType(CreateBalanceSnapshotDto) {
    
}
