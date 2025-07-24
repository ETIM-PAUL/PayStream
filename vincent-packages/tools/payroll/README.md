# payroll

A Vincent tool for automated payroll: batch ERC20 payments to employees on the Base network, with policy-based governance and validation.

## Overview

The `payroll` tool enables secure, automated ERC20 payroll through the Vincent Framework, providing:

- **Batch ERC20 payments** to multiple employees in a single run
- **Employee status enforcement** (only active employees are paid)
- **Policy-based governance** (e.g., pay cycle, emplooyee active status, multi signature approval for payment, active company payment confirmation)
- **Comprehensive validation** for addresses, salaries, and network parameters
- **Multi-network support** (default: Yellowstone)
- **Real-time transaction execution** with detailed logging and error handling

The Employees Payroll system is powered by a payroll contract deployed on yellowstone network - 0x606CbC3D95E36c8b22bC671285154a722f25170E

The contract allows companies register (with their full details, owner and admins for signature).

These companies can inturn, add employees (employee position, their salary, their work status,etc )

With the payroll tool (PayStream) - the active employees are paid their salary, every two weeks based on if the company payment status is activated and the company admins have signed the payment to be processed.

## Parameters

| Parameter      | Type    | Description                                      |
|---------------|---------|--------------------------------------------------|
| employees     | array   | List of employees (address, position, salary, status) |
| company     | object   | company details (address, admin1, admin2, lastPaymentCycle) |
| tokenAddress  | string  | ERC20 contract address (default: Base USDC)       |
| tokenDecimals | number  | Token decimals (default: 18 for ERC20)             |
| rpcUrl        | string  | RPC endpoint (default: Yellowstone)                     |
| chainId       | number  | Network chain ID (default: 8453 for Base)        |

### Employee Object
| Field    | Type   | Description                |
|----------|--------|----------------------------|
| address  | string | Employee wallet address    |
| position | string | Employee position/role     |
| salary   | string | Salary in ERC20 (as string) |
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
  company: {
    id: "1",
    owner: "0x123",
    admin1: "0xadmin1",
    admin2: "0xadmin2",
    paymentConfirmation: true,
    lastPaymentCycle: "2833227" //in timestamp"
  }
  tokenAddress: "0xF77025Db69882AD1c7f18D2A1C5B8821C091916C", // ERC20 on Yellowstone
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
- Only companies with active payment status will have employees salary payment processed
- Policy can enforce pay cycle, deactivation, etc.
- Multi Adminstrative Signature required for processing salary payment for employees