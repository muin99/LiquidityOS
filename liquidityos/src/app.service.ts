import { Injectable } from '@nestjs/common';
import { LiquidityCheckDto } from './dto/liquidity-check.dto';


export interface Status {
  application: string;
  status: string;
  database: string;
  timestamp: string;
}

interface platformFeatures {
  authentication: boolean;
  wallets: boolean;
  liquidityRequests: boolean;
  notifications: boolean;
}

export interface PlatformInfo {
  name: string;
  version: string;
  actors: string[];
  features: platformFeatures;
}

export interface LiquidityCheckResponse {
  agentName: string;
  canServeCustomer: boolean;
  shortageAmount: number;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'LiquidityOS API is running';
  }


  getStatus(): Status {
    const stats: Status = {
      application: "LiquidityOS",
      status: "running",
      database: "connected",
      timestamp: new Date().toISOString()
    };
    return stats;
  }

  getPlatformInfo(): PlatformInfo {
    return {
      "name": "LiquidityOS",
      "version": "1.0.0",
      "actors": [
        "admin",
        "provider",
        "coordinator",
        "agent"
      ],
      "features": {
        "authentication": true,
        "wallets": true,
        "liquidityRequests": true,
        "notifications": true
      }
    }
  }

  liquidityCheck(body: LiquidityCheckDto): LiquidityCheckResponse {
    const res : LiquidityCheckResponse={
      agentName: body.agentName,
      canServeCustomer: false,
      shortageAmount: -1
    }
    if (body.availableCash < body.requestedCash) {
      res.canServeCustomer = false;
      res.shortageAmount = body.requestedCash - body.availableCash;
    }
    else {
      res.canServeCustomer = true;
      res.shortageAmount = 0;
    }

    return res;
  }
}
