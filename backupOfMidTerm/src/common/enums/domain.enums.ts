export enum UserRole {
  ADMIN = 'ADMIN',
  PROVIDER = 'PROVIDER',
  AGENT = 'AGENT',
  COORDINATOR = 'COORDINATOR',
}

export enum OwnerType {
  AGENT = 'AGENT',
  COORDINATOR = 'COORDINATOR',
}

export enum LiquidityType {
  PHYSICAL_CASH = 'PHYSICAL_CASH',
  E_MONEY = 'E_MONEY',
}

export enum Urgency {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

export enum TransferType {
  COORDINATOR_SUPPLY = 'COORDINATOR_SUPPLY',
  AGENT_SUPPLY = 'AGENT_SUPPLY',
  PROVIDER_SUPPLY = 'PROVIDER_SUPPLY',
}
