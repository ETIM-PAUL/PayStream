import { createVincentTool, createVincentToolPolicy, supportedPoliciesForTool, } from "@lit-protocol/vincent-tool-sdk";
import "@lit-protocol/vincent-tool-sdk/internal";
import { bundledVincentPolicy } from "../../../../policies/cycle_status_policy/dist/index.js";
import { bundledVincentPolicy as bundledVincentSignaturesPolicy } from "../../../../policies/double_signature_policy/dist/index.js";
import { executeFailSchema, executeSuccessSchema, precheckFailSchema, precheckSuccessSchema, toolParamsSchema, employeeSchema, } from "./schemas";
import { laUtils } from "@lit-protocol/vincent-scaffold-sdk";
import { ERC20_TRANSFER_ABI, isValidAddress, isValidAmount, parseTokenAmount, } from "./helpers";
import { commitAllowedPolicies } from "./helpers/commit-allowed-policies";
const Cycle_EmployeeStatus_Policy = createVincentToolPolicy({
    toolParamsSchema,
    bundledVincentPolicy,
    toolParameterMappings: {
        employees: "employees",
        company: "company"
    }
});
const DoubleSignaturePolicy = createVincentToolPolicy({
    toolParamsSchema,
    bundledVincentPolicy: bundledVincentSignaturesPolicy,
    toolParameterMappings: {
        employees: "employees",
        company: "company"
    }
});
export const vincentTool = createVincentTool({
    packageName: "@agentic-ai/vincent-tool-payroll",
    toolParamsSchema,
    supportedPolicies: supportedPoliciesForTool([Cycle_EmployeeStatus_Policy, DoubleSignaturePolicy]),
    precheckSuccessSchema,
    precheckFailSchema,
    executeSuccessSchema,
    executeFailSchema,
    precheck: async ({ toolParams }, { succeed, fail }) => {
        const errors = [];
        let validEmployees = 0;
        let invalidEmployees = 0;
        console.log("emp", toolParams.employees);
        for (const [i, emp] of toolParams.employees.entries()) {
            const result = employeeSchema.safeParse(emp);
            if (!result.success) {
                errors.push(`Employee #${i + 1}: ${result.error.message}`);
                invalidEmployees++;
            }
            else if (emp.status !== "active") {
                errors.push(`Employee #${i + 1}: Not active`);
                invalidEmployees++;
            }
            else {
                validEmployees++;
            }
        }
        if (validEmployees === 0) {
            return fail({ error: "No valid active employees to pay. Errors: " + errors.join("; ") });
        }
        return succeed({ validEmployees, invalidEmployees, errors });
    },
    execute: async ({ toolParams }, { succeed, fail, delegation, policiesContext }) => {
        const { employees, tokenAddress, tokenDecimals, rpcUrl, chainId } = toolParams;
        const provider = new ethers.providers.JsonRpcProvider(rpcUrl, chainId);
        const pkpPublicKey = delegation.delegatorPkpInfo.publicKey;
        if (!pkpPublicKey) {
            return fail({ error: "PKP public key not available from delegation context" });
        }
        const callerAddress = laUtils.helpers.toEthAddress(pkpPublicKey);
        // Check native balance for gas fees (estimate for all transfers)
        let nativeBalance;
        try {
            nativeBalance = await provider.getBalance(callerAddress);
        }
        catch (e) {
            return fail({ error: "Failed to check native balance: " + (e instanceof Error ? e.message : String(e)) });
        }
        const estimatedGasLimit = 65000 * employees.length;
        const gasPrice = await provider.getGasPrice();
        const estimatedGasCost = gasPrice.mul(estimatedGasLimit);
        if (nativeBalance.lt(estimatedGasCost)) {
            return fail({ error: `Insufficient native balance for gas. Need ${ethers.utils.formatEther(estimatedGasCost)} ETH, but only have ${ethers.utils.formatEther(nativeBalance)} ETH` });
        }
        // Check ERC-20 token balance (sum of all active salaries)
        let tokenContract, tokenBalance;
        try {
            tokenContract = new ethers.Contract(tokenAddress, ERC20_TRANSFER_ABI, provider);
            tokenBalance = await tokenContract.balanceOf(callerAddress);
        }
        catch (e) {
            return fail({ error: "Failed to check token balance: " + (e instanceof Error ? e.message : String(e)) });
        }
        let totalToSend = employees
            .filter((e) => e.status === "active")
            .reduce((sum, e) => sum + parseFloat(e.salary), 0);
        const totalToSendWei = parseTokenAmount(totalToSend.toString(), tokenDecimals);
        if (tokenBalance.lt(totalToSendWei)) {
            return fail({ error: `Insufficient token balance. Need ${ethers.utils.formatUnits(totalToSendWei, tokenDecimals)} tokens, but only have ${ethers.utils.formatUnits(tokenBalance, tokenDecimals)} tokens` });
        }
        // Batch pay each active employee
        const results = [];
        for (const emp of employees) {
            if (emp.status !== "active") {
                results.push({ ...emp, error: "Not active" });
                continue;
            }
            // Validate address and salary again for safety
            if (!isValidAddress(emp.address)) {
                results.push({ ...emp, error: "Invalid address" });
                continue;
            }
            if (!isValidAmount(emp.salary)) {
                results.push({ ...emp, error: "Invalid salary amount" });
                continue;
            }
            const salaryWei = parseTokenAmount(emp.salary, tokenDecimals);
            try {
                const txHash = await laUtils.transaction.handler.contractCall({
                    provider,
                    pkpPublicKey,
                    callerAddress,
                    contractAddress: tokenAddress,
                    abi: ERC20_TRANSFER_ABI,
                    functionName: "transfer",
                    args: [emp.address, salaryWei],
                    chainId,
                });
                results.push({ ...emp, txHash });
            }
            catch (err) {
                results.push({ ...emp, error: err instanceof Error ? err.message : String(err) });
            }
        }
        // Policy commit (optional, for audit)
        await commitAllowedPolicies(policiesContext, "[@agentic-ai/vincent-tool-payroll/execute]");
        return succeed({ results, timestamp: Date.now() });
    },
});
