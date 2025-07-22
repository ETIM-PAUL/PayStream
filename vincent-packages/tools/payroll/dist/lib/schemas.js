import { z } from "zod";
/**
 * Employee schema
 */
export const employeeSchema = z.object({
    address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address"),
    position: z.string().min(1, "Position required"),
    salary: z
        .string()
        .regex(/^[0-9]+(\.[0-9]+)?$/, "Invalid salary format")
        .refine((val) => parseFloat(val) > 0, "Salary must be greater than 0"),
    status: z.enum(["active", "inactive"]),
});
/**
 * Tool parameters schema - defines the input parameters for the payroll tool
 */
export const toolParamsSchema = z.object({
    employees: z.array(employeeSchema),
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
        status: z.enum(["active", "inactive"]),
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
