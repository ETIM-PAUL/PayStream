# payroll

A Vincent tool for automated payroll: batch USDC payments to employees on the Base network, with policy-based governance and validation.

## Overview

The `payroll` tool enables secure, automated USDC payroll through the Vincent Framework, providing:

- **Batch USDC payments** to multiple employees in a single run
- **Employee status enforcement** (only active employees are paid)
- **Policy-based governance** (e.g., pay cycle, deactivation)
- **Comprehensive validation** for addresses, salaries, and network parameters
- **Multi-network support** (default: Base)
- **Real-time transaction execution** with detailed logging and error handling

## Parameters

| Parameter      | Type    | Description                                      |
|---------------|---------|--------------------------------------------------|
| employees     | array   | List of employees (address, position, salary, status) |
| tokenAddress  | string  | USDC contract address (default: Base USDC)       |
| tokenDecimals | number  | Token decimals (default: 6 for USDC)             |
| rpcUrl        | string  | RPC endpoint (default: Base)                     |
| chainId       | number  | Network chain ID (default: 8453 for Base)        |

### Employee Object
| Field    | Type   | Description                |
|----------|--------|----------------------------|
| address  | string | Employee wallet address    |
| position | string | Employee position/role     |
| salary   | string | Salary in USDC (as string) |
| status   | string | "active" or "inactive"     |

## Usage Example

### Payroll Batch on Base USDC
```typescript
const payrollParams = {
  employees: [
    { address: "0x123...", position: "Engineer", salary: "1000", status: "active" },
    { address: "0x456...", position: "Designer", salary: "900", status: "inactive" },
    // ...
  ],
  tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base USDC
  tokenDecimals: 18,
  rpcUrl: "https://yellowstone-rpc.litprotocol.com/",
  chainId: 175188
};
```

## Output

- Success: Array of results per employee (address, status, txHash or error)
- Fail: General error for the batch

## Policy Integration

- Only active employees are paid
- Policy can enforce pay cycle, deactivation, etc.