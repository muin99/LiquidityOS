# LiquidityOS API Documentation

## Submission Information

- **Project Title:** LiquidityOS — Smart Liquidity Management System
- **Base URL:** `http://localhost:3000/api/v1`
- **Authentication:** JWT Bearer token
- **Roles:** `admin`, `provider`, `agent`, `coordinator`
- **Content-Type:** `application/json`

For protected endpoints, add this header:

```text
Authorization: Bearer <accessToken>
```

## Authentication APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/auth/register` | Register a user | Public |
| POST | `/auth/login` | Login and receive a JWT token | Public |
| GET | `/auth/me` | View the logged-in user | Authenticated |

### Register user

`POST /auth/register`

```json
{
  "name": "System Admin",
  "email": "admin@example.com",
  "phone": "+8801712345678",
  "password": "AdminPass123!",
  "role": "admin"
}
```

### Login

`POST /auth/login`

```json
{
  "identifier": "admin@example.com",
  "password": "AdminPass123!"
}
```

## User APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/users` | List users | Admin |
| GET | `/users/:id` | View one user | Authenticated |
| PATCH | `/users/:id` | Update a user | Authenticated |
| DELETE | `/users/:id` | Delete a user | Admin |

## Area APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/areas` | Create an area | Admin |
| GET | `/areas` | List areas | Authenticated |
| GET | `/areas/:id` | View an area | Authenticated |
| PATCH | `/areas/:id` | Update an area | Admin |
| DELETE | `/areas/:id` | Delete an area | Admin |

### Create area

```json
{
  "name": "Dhaka North",
  "code": "DHA_NORTH",
  "status": "active"
}
```

## Provider APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/providers` | Create provider | Admin |
| GET | `/providers` | List providers; supports `status`, `search`, `page`, `limit` | Admin |
| GET | `/providers/:id` | View provider | Authenticated |
| PATCH | `/providers/:id` | Update provider | Admin |
| DELETE | `/providers/:id` | Delete provider | Admin |
| POST | `/providers/:id/approve` | Approve provider onboarding | Admin |
| POST | `/providers/:id/reject` | Reject provider onboarding | Admin |
| GET | `/providers/:id/agents` | List provider agents | Authenticated |
| GET | `/providers/:id/coordinators` | List linked coordinators | Authenticated |
| POST | `/providers/:id/coordinators/:coordinatorId/approve` | Approve coordinator link | Admin, Provider |
| POST | `/providers/:id/coordinators/:coordinatorId/reject` | Reject coordinator link | Admin, Provider |
| GET | `/providers/:id/shortages` | List provider liquidity requests | Authenticated |
| GET | `/providers/:id/dashboard` | View dashboard metrics | Authenticated |
| POST | `/providers/:id/wallets/supply` | Supply liquidity to coordinator | Admin, Provider |

### Create provider

```json
{
  "name": "Demo MFS Provider",
  "tenantCode": "DEMO_MFS",
  "contactName": "Operations Team",
  "contactEmail": "operations@example.com",
  "contactPhone": "+8801712345678"
}
```

### Approve or reject provider

```json
{
  "approvalNote": "Compliance checks completed."
}
```

```json
{
  "rejectionReason": "Required documents are missing."
}
```

### Provider wallet supply

Header required:

```text
Idempotency-Key: supply-001
```

```json
{
  "fromWalletId": "SOURCE_WALLET_UUID",
  "toWalletId": "COORDINATOR_WALLET_UUID",
  "amount": 75000,
  "transferType": "PROVIDER_SUPPLY"
}
```

## Agent APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/agents/onboard` | Create agent profile | Admin, Provider |
| GET | `/agents` | List agents; optional `providerId` filter | Authenticated |
| GET | `/agents/:id` | View agent | Authenticated |
| PATCH | `/agents/:id` | Update agent | Admin, Provider |
| DELETE | `/agents/:id` | Delete agent | Admin |

### Onboard agent

```json
{
  "userId": "USER_UUID",
  "providerId": "PROVIDER_UUID",
  "areaId": "AREA_UUID",
  "shopName": "Karim Telecom",
  "address": "House 12, Road 5, Dhaka"
}
```

## Coordinator APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/coordinators/onboard` | Create coordinator profile | Admin |
| GET | `/coordinators` | List coordinators | Authenticated |
| GET | `/coordinators/:id` | View coordinator | Authenticated |
| PATCH | `/coordinators/:id` | Update coordinator | Admin |
| DELETE | `/coordinators/:id` | Delete coordinator | Admin |

### Onboard coordinator

```json
{
  "userId": "USER_UUID",
  "areaId": "AREA_UUID",
  "name": "Dhaka Liquidity Team"
}
```

## Wallet APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/wallets` | Create wallet | Admin, Provider |
| GET | `/wallets` | List wallets; optional `providerId` and `ownerId` filters | Authenticated |
| GET | `/wallets/:id` | View wallet | Authenticated |
| PATCH | `/wallets/:id` | Change wallet status: `active` or `frozen` | Admin, Provider |
| DELETE | `/wallets/:id` | Delete a zero-balance wallet | Admin |

### Create wallet

```json
{
  "ownerId": "AGENT_OR_COORDINATOR_UUID",
  "ownerType": "AGENT",
  "providerId": "PROVIDER_UUID",
  "walletType": "E_MONEY"
}
```

## Liquidity Request APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/liquidity-requests` | Create a shortage request | Provider, Agent, Coordinator |
| GET | `/liquidity-requests` | List requests; optional `providerId`, `status` filters | Authenticated |
| GET | `/liquidity-requests/:id` | View request | Authenticated |
| PATCH | `/liquidity-requests/:id` | Update an open request | Authenticated |
| POST | `/liquidity-requests/:id/cancel` | Cancel an open request | Authenticated |
| DELETE | `/liquidity-requests/:id` | Delete request | Authenticated |

### Create liquidity request

```json
{
  "requesterId": "AGENT_UUID",
  "requesterType": "AGENT",
  "liquidityType": "PHYSICAL_CASH",
  "providerId": "PROVIDER_UUID",
  "areaId": "AREA_UUID",
  "amount": 100000,
  "urgency": "HIGH",
  "allowPartial": true,
  "expiresAt": "2026-08-01T12:00:00.000Z",
  "notes": "Cash-out demand is high."
}
```

## Liquidity Offer APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/liquidity-offers` | Submit an offer | Coordinator |
| GET | `/liquidity-offers` | List offers; optional `requestId`, `coordinatorId` filters | Authenticated |
| GET | `/liquidity-offers/:id` | View offer | Authenticated |
| PATCH | `/liquidity-offers/:id` | Update submitted offer | Coordinator |
| POST | `/liquidity-offers/:id/withdraw` | Withdraw submitted offer | Coordinator |
| DELETE | `/liquidity-offers/:id` | Delete offer | Admin, Coordinator |

### Create liquidity offer

```json
{
  "requestId": "REQUEST_UUID",
  "coordinatorId": "COORDINATOR_UUID",
  "availableAmount": 75000,
  "etaMinutes": 30,
  "note": "Can deliver within 30 minutes."
}
```

## Liquidity Transfer APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/liquidity-transfers` | Execute wallet-to-wallet transfer | Provider, Agent, Coordinator |
| GET | `/liquidity-transfers` | List transfers | Authenticated |
| GET | `/liquidity-transfers/:id` | View transfer | Authenticated |

### Execute transfer

Header required:

```text
Idempotency-Key: transfer-001
```

```json
{
  "fromWalletId": "SOURCE_WALLET_UUID",
  "toWalletId": "DESTINATION_WALLET_UUID",
  "amount": 50000,
  "transferType": "COORDINATOR_SUPPLY"
}
```

## Points APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| GET | `/points/balance` | View the current user's point balance | Authenticated |
| GET | `/points/transactions` | View the current user's point ledger | Authenticated |
| POST | `/points/redeem` | Redeem available points | Authenticated |

### Redeem points

```json
{
  "catalogItemId": "reward-voucher-01",
  "points": 100
}
```

## Notification APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/notifications` | Create an in-app notification | Admin |
| GET | `/notifications` | List current user's notifications; optional `status` filter | Authenticated |
| PATCH | `/notifications/:id/read` | Mark one notification as read | Authenticated |
| POST | `/notifications/read-all` | Mark all current-user notifications as read | Authenticated |

### Create notification

```json
{
  "userId": "USER_UUID",
  "type": "REQUEST_CREATED",
  "payload": {
    "message": "A new liquidity request is available."
  }
}
```

## Dispute APIs

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/disputes` | Open a dispute for a request or transfer | Authenticated |
| GET | `/disputes` | List all disputes | Admin |
| GET | `/disputes/:id` | View dispute details | Authenticated |
| POST | `/disputes/:id/resolve` | Resolve or reject dispute | Admin |

### Open dispute

```json
{
  "transferId": "TRANSFER_UUID",
  "reason": "The recipient reported that the wallet balance did not update."
}
```

### Resolve dispute

```json
{
  "resolutionType": "resolved",
  "note": "Transfer was verified and the recipient wallet was credited."
}
```

## Validation and Business Rules

- All IDs must be valid UUIDs.
- Monetary amounts must be positive integers.
- Passwords must contain at least 8 characters.
- Agent-to-agent wallet transfers are blocked.
- Frozen wallets cannot send or receive transfers.
- Source and destination wallet types must match.
- Source wallets must have sufficient balance.
- Transfers use database transactions for atomic debit and credit updates.
- `Idempotency-Key` prevents duplicate transfers and provider wallet supplies.
- Invalid input returns HTTP `400`; missing records return `404`; duplicate/conflicting operations return `409`.
