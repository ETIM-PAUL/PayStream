import { createVincentPolicy } from "@lit-protocol/vincent-tool-sdk";
import { commitAllowResultSchema, commitDenyResultSchema, commitParamsSchema, evalAllowResultSchema, evalDenyResultSchema, precheckAllowResultSchema, precheckDenyResultSchema, toolParamsSchema, userParamsSchema, } from "./schemas";
// Mock/stub: In a real implementation, this would query on-chain or persistent storage
const lastPaidTimestamps = {};
function getLastPaid(address) {
    return lastPaidTimestamps[address];
}
function setLastPaid(address, timestamp) {
    lastPaidTimestamps[address] = timestamp;
}
export const vincentPolicy = createVincentPolicy({
    packageName: "@agentic-ai/vincent-cycle_status_policy",
    toolParamsSchema,
    userParamsSchema,
    commitParamsSchema,
    precheckAllowResultSchema,
    precheckDenyResultSchema,
    evalAllowResultSchema,
    evalDenyResultSchema,
    commitAllowResultSchema,
    commitDenyResultSchema,
    precheck: async ({ toolParams, userParams }, { allow, deny }) => {
        const now = Math.floor(Date.now() / 1000);
        const payPeriod = Number(userParams.payPeriodSeconds);
        const allowed = [];
        const denied = [];
        if (!toolParams.employees || toolParams.employees.length === 0) {
            return deny({ reason: "Employee list is empty. Payroll cannot proceed." });
        }
        for (const emp of toolParams.employees) {
            if (emp.status !== "active") {
                denied.push({ address: emp.address, reason: "Inactive employee" });
                continue;
            }
            const lastPaid = getLastPaid(emp.address);
            if (lastPaid !== undefined && now - lastPaid < payPeriod) {
                denied.push({ address: emp.address, reason: `Already paid in this cycle (last paid at ${lastPaid})` });
                continue;
            }
            allowed.push({ address: emp.address });
        }
        if (allowed.length === 0) {
            return deny({ reason: "No employees eligible for payment in this cycle." });
        }
        return allow({ allowed, denied });
    },
    evaluate: async ({ toolParams, userParams }, { allow, deny }) => {
        // Same logic as precheck for this policy
        const now = Math.floor(Date.now() / 1000);
        const payPeriod = Number(userParams.payPeriodSeconds);
        const allowed = [];
        const denied = [];
        for (const emp of toolParams.employees) {
            if (emp.status !== "active") {
                denied.push({ address: emp.address, reason: "Inactive employee" });
                continue;
            }
            const lastPaid = getLastPaid(emp.address);
            if (lastPaid !== undefined && now - lastPaid < payPeriod) {
                denied.push({ address: emp.address, reason: `Already paid in this cycle (last paid at ${lastPaid})` });
                continue;
            }
            allowed.push({ address: emp.address });
        }
        if (allowed.length === 0) {
            return deny({ reason: "No employees eligible for payment in this cycle." });
        }
        return allow({ allowed, denied });
    },
    commit: async (commitParams, { allow }) => {
        // Record payment timestamp for each paid employee
        const now = Math.floor(Date.now() / 1000);
        const recorded = [];
        //
        for (const payment of commitParams.payments) {
            setLastPaid(payment.address, now);
            recorded.push({ address: payment.address, paidAt: now });
        }
        return allow({ recorded });
    },
});
