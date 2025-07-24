import { z } from "zod";
/**
 * Employee schema (for toolParams)
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
 * Tool parameters schema - matches the payroll tool
 */
export const toolParamsSchema = z.object({
    employees: z.array(employeeSchema),
});
/**
 * User parameters schema - policy configuration set by the user
 */
export const userParamsSchema = z.object({
    payPeriodSeconds: z.bigint().min(1n).default(1209600n), // 2 weeks
    admin: z.string().regex(/^0x[a-fA-F0-9]{40}$/).optional(),
});
/**
 * Commit parameters schema - data passed to commit phase
 * Array of { address, paidAt }
 */
export const commitParamsSchema = z.object({
    payments: z.array(z.object({
        address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
        paidAt: z.number(),
    })),
});
/**
 * Precheck allow result schema (per employee)
 */
export const precheckAllowResultSchema = z.object({
    allowed: z.array(z.object({
        address: z.string(),
        reason: z.string().optional(),
    })),
    denied: z.array(z.object({
        address: z.string(),
        reason: z.string(),
    })),
});
/**
 * Precheck deny result schema (batch-level error)
 */
export const precheckDenyResultSchema = z.object({
    reason: z.string(),
});
/**
 * Evaluate allow result schema (per employee)
 */
export const evalAllowResultSchema = precheckAllowResultSchema;
/**
 * Evaluate deny result schema (batch-level error)
 */
export const evalDenyResultSchema = precheckDenyResultSchema;
/**
 * Commit allow result schema (per employee)
 */
export const commitAllowResultSchema = z.object({
    recorded: z.array(z.object({
        address: z.string(),
        paidAt: z.number(),
    })),
});
/**
 * Commit deny result schema (batch-level error)
 */
export const commitDenyResultSchema = z.object({
    reason: z.string(),
});
