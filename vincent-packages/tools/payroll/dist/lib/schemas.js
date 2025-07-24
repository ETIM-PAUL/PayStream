import { z } from "zod";
/**
 * Employee schema
 */
export const employeeSchema = z.object({
    id: z.string(),
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    position: z.string().min(1, "Position required"),
    salary: z
        .string()
        .regex(/^[0-9]+(\.[0-9]+)?$/, "Invalid salary format")
        .refine((val) => parseFloat(val) > 0, "Salary must be greater than 0"),
    dob: z
        .string(),
    dateOfEmployment: z
        .string(),
    status: z.string(),
});
/**
 * Company schema (for toolParams)
*/
export const companySchema = z.object({
    id: z.string(),
    owner: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    admin1: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    admin2: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    lastPaymentCycle: z.string()
});
/**
 * Tool parameters schema - defines the input parameters for the payroll tool
 */
export const toolParamsSchema = z.object({
    employees: z.array(employeeSchema),
    company: companySchema,
    tokenAddress: z
        .string()
        .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid token contract address"),
    tokenDecimals: z
        .number()
        .int()
        .min(0, "Token decimals must be non-negative")
        .max(18, "Token decimals must not exceed 18")
        .default(18), // FLR on Base
    rpcUrl: z
        .string()
        .url("Invalid RPC URL format")
        .optional()
        .default("https://yellowstone-rpc.litprotocol.com/"),
    chainId: z
        .number()
        .int()
        .positive("Chain ID must be a positive integer")
        .optional()
        .default(8453), // Base mainnet
});
/**
 * Precheck success result schema
 */
export const precheckSuccessSchema = z.object({
    validEmployees: z.number(),
    invalidEmployees: z.number(),
    errors: z.array(z.string()),
});
/**
 * Precheck failure result schema
 */
export const precheckFailSchema = z.object({
    error: z.string(),
});
/**
 * Execute success result schema (batch)
 */
export const executeSuccessSchema = z.object({
    results: z.array(z.object({
        address: z.string(),
        position: z.string(),
        salary: z.string(),
        status: z.string(),
        txHash: z.string().optional(),
        error: z.string().optional(),
    })),
    timestamp: z.number(),
});
/**
 * Execute failure result schema
 */
export const executeFailSchema = z.object({
    error: z.string(),
});
