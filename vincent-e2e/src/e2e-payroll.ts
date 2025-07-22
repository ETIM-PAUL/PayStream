import {
  PARAMETER_TYPE,
  createAppConfig,
  init,
  suppressLitLogs,
} from "@lit-protocol/vincent-scaffold-sdk/e2e";

suppressLitLogs(false);

import { getVincentToolClient } from "@lit-protocol/vincent-app-sdk";
// Payroll Tool and Policy
import { bundledVincentTool as payrollTool } from "../../vincent-packages/tools/payroll/dist/index.js";
import { vincentPolicyMetadata as payrollPolicyMetadata } from "../../vincent-packages/policies/payroll-policy/dist/index.js";

(async () => {
  // Initialise the environment
  const { accounts, chainClient } = await init({
    network: "datil",
    deploymentStatus: "dev",
  });

  // Prepare the payroll tool client
  const payrollToolClient = getVincentToolClient({
    bundledVincentTool: payrollTool,
    ethersSigner: accounts.delegatee.ethersWallet,
  });

  // Prepare the IPFS CIDs for the tool and policy
  const appConfig = createAppConfig(
    {
      toolIpfsCids: [payrollTool.ipfsCid],
      toolPolicies: [
        [payrollPolicyMetadata.ipfsCid], // Enable payroll policy for payroll tool
      ],
      toolPolicyParameterNames: [
        ["payrollWindowSeconds", "maxTotalPayroll"], // Example parameter names for payroll policy
      ],
      toolPolicyParameterTypes: [
        [PARAMETER_TYPE.UINT256, PARAMETER_TYPE.UINT256],
      ],
      toolPolicyParameterValues: [
        ["60", "1000000"], // payrollWindowSeconds: 60, maxTotalPayroll: 1,000,000
      ],
    },
    {
      cidToNameMap: {
        [payrollTool.ipfsCid]: "Payroll Tool",
        [payrollPolicyMetadata.ipfsCid]: "Payroll Policy",
      },
      debug: true,
    }
  );

  const toolAndPolicyIpfsCids = [
    payrollTool.ipfsCid,
    payrollPolicyMetadata.ipfsCid,
  ];

  // Mint an Agent Wallet PKP
  const agentWalletPkp = await accounts.agentWalletPkpOwner.mintAgentWalletPkp({
    toolAndPolicyIpfsCids: toolAndPolicyIpfsCids,
  });

  console.log("🤖 Agent Wallet PKP:", agentWalletPkp);

  // Register Vincent app with delegatee
  const { appId, appVersion } = await chainClient.registerApp({
    toolIpfsCids: appConfig.TOOL_IPFS_CIDS,
    toolPolicies: appConfig.TOOL_POLICIES,
    toolPolicyParameterNames: appConfig.TOOL_POLICY_PARAMETER_NAMES,
    toolPolicyParameterTypes: appConfig.TOOL_POLICY_PARAMETER_TYPES,
  });

  console.log("✅ Vincent app registered:", { appId, appVersion });

  // Permit PKP to use the app version
  await chainClient.permitAppVersion({
    pkpTokenId: agentWalletPkp.tokenId,
    appId,
    appVersion,
    toolIpfsCids: appConfig.TOOL_IPFS_CIDS,
    policyIpfsCids: appConfig.TOOL_POLICIES,
    policyParameterNames: appConfig.TOOL_POLICY_PARAMETER_NAMES,
    policyParameterValues: appConfig.TOOL_POLICY_PARAMETER_VALUES,
    policyParameterTypes: appConfig.TOOL_POLICY_PARAMETER_TYPES,
  });

  console.log("✅ PKP permitted to use app version");

  // Permit auth methods for the agent wallet PKP
  const permittedAuthMethodsTxHashes =
    await accounts.agentWalletPkpOwner.permittedAuthMethods({
      agentWalletPkp: agentWalletPkp,
      toolAndPolicyIpfsCids: toolAndPolicyIpfsCids,
    });

  console.log(
    "✅ Permitted Auth Methods Tx hashes:",
    permittedAuthMethodsTxHashes
  );

  // Validate delegatee permissions (debugging)
  const validation = await chainClient.validateToolExecution({
    delegateeAddress: accounts.delegatee.ethersWallet.address,
    pkpTokenId: agentWalletPkp.tokenId,
    toolIpfsCid: payrollTool.ipfsCid,
  });

  console.log("✅ Tool execution validation:", validation);

  if (!validation.isPermitted) {
    throw new Error(
      `❌ Delegatee is not permitted to execute tool for PKP. Validation: ${JSON.stringify(
        validation,
        (key, value) => (typeof value === "bigint" ? value.toString() : value)
      )}`
    );
  }

  // Test payroll tool and policy
  console.log(`🧪 Testing Payroll tool with payroll policy`);
  console.log(
    "💡 Testing on Base network - each payroll transfer costs approximately 0.0000001 ETH in gas fees"
  );

  // Array to collect transaction hashes from successful executions
  const transactionHashes: string[] = [];

  const TEST_TOOL_PARAMS = {
    employees: [
      {
        address: "0x0daAd898fd44B4af14d0d169c1bbA4f13bcD7D26",
        position: "Engineer",
        salary: "0.00000000000000001",
        status: "active" as "active",
      },
      {
        address: "0x0daAd898fd44B4af14d0d169c1bbA4f13bcD7D26",
        position: "Designer",
        salary: "0.00000000000000002",
        status: "active" as "active",
      },
      {
        address: "0x0daAd898fd44B4af14d0d169c1bbA4f13bcD7D26",
        position: "Manager",
        salary: "0.00000000000000003",
        status: "inactive" as "inactive",
      },
    ],
    tokenAddress: "0xF77025Db69882AD1c7f18D2A1C5B8821C091916C", // Base USDC Contract Address
    tokenDecimals: 18,
    rpcUrl: "https://yellowstone-rpc.litprotocol.com/",
    chainId: 175188,
  };

  const precheck = async () => {
    return await payrollToolClient.precheck(TEST_TOOL_PARAMS, {
      delegatorPkpEthAddress: agentWalletPkp.ethAddress,
    });
  };

  const execute = async () => {
    return await payrollToolClient.execute(TEST_TOOL_PARAMS, {
      delegatorPkpEthAddress: agentWalletPkp.ethAddress,
    });
  };

  // Test 1: First payroll should succeed
  console.log("(PRECHECK-TEST-1) First payroll (should succeed)");
  const payrollPrecheckRes1 = await precheck();
  console.log("(PRECHECK-RES[1]): ", payrollPrecheckRes1);

  if (!payrollPrecheckRes1.success) {
    throw new Error(
      `❌ First payroll precheck should succeed: ${JSON.stringify(
        payrollPrecheckRes1
      )}`
    );
  }

  console.log("(EXECUTE-TEST-1) First payroll (should succeed)");
  const executeRes1 = await execute();

  console.log("(EXECUTE-RES[1]): ", executeRes1);

  if (!executeRes1.success) {
    throw new Error(
      `❌ First payroll execute should succeed: ${JSON.stringify(executeRes1)}`
    );
  }

  // Collect transaction hashes if successful
  if (executeRes1.success && executeRes1.result?.results) {
    executeRes1.result.results.forEach((res: any) => {
      if (res.txHash) transactionHashes.push(res.txHash);
    });
  }

  console.log("(✅ EXECUTE-TEST-1) First payroll completed successfully");

  // Test 2: Second payroll should succeed (if within policy limits)
  console.log("(PRECHECK-TEST-2) Second payroll (should succeed)");
  const payrollPrecheckRes2 = await precheck();
  console.log("(PRECHECK-RES[2]): ", payrollPrecheckRes2);

  if (!payrollPrecheckRes2.success) {
    throw new Error(
      `❌ (PRECHECK-TEST-2) Second payroll precheck should succeed: ${JSON.stringify(
        payrollPrecheckRes2
      )}`
    );
  }

  const executeRes2 = await execute();

  console.log("(EXECUTE-RES[2]): ", executeRes2);

  if (!executeRes2.success) {
    throw new Error(
      `❌ (EXECUTE-TEST-2) Second payroll execute should succeed: ${JSON.stringify(
        executeRes2
      )}`
    );
  }

  // Collect transaction hashes if successful
  if (executeRes2.success && executeRes2.result?.results) {
    executeRes2.result.results.forEach((res: any) => {
      if (res.txHash) transactionHashes.push(res.txHash);
    });
  }

  console.log("(✅ EXECUTE-TEST-2) Second payroll completed successfully");

  // Test 3: Third payroll should fail (limit exceeded)
  console.log(
    "(PRECHECK-TEST-3) Third payroll (should fail - limit exceeded)"
  );
  const payrollPrecheckRes3 = await precheck();
  console.log("(PRECHECK-RES[3]): ", payrollPrecheckRes3);

  if (payrollPrecheckRes3.success) {
    console.log(
      "✅ (PRECHECK-TEST-3) Third payroll precheck succeeded (expected - precheck only validates tool parameters)"
    );

    // Test if execution is properly blocked by policy
    console.log(
      "🧪 (EXECUTE-TEST-3) Testing if payroll execution is blocked by policy (this is where enforcement happens)..."
    );

    const executeRes3 = await execute();

    console.log("(EXECUTE-RES[3]): ", executeRes3);

    if (executeRes3.success) {
      executeRes3.result?.results?.forEach((res: any) => {
        if (res.txHash) transactionHashes.push(res.txHash);
      });
      throw new Error(
        "❌ (EXECUTE-TEST-3) CRITICAL: Third payroll execution should have been blocked by policy but succeeded!"
      );
    } else {
      console.log(
        "✅ (EXECUTE-TEST-3) PERFECT: Third payroll execution correctly blocked by payroll policy!"
      );
      console.log(
        "🎉 (EXECUTE-TEST-3) PAYROLL POLICY SYSTEM WORKING CORRECTLY!"
      );
      console.log(
        "📊 (EXECUTE-TEST-3) Policy properly enforced: 2 payrolls allowed, 3rd payroll blocked"
      );
    }
  } else {
    console.log(
      "🟨 (PRECHECK-TEST-3) Third payroll precheck failed (unexpected but also fine)"
    );
    console.log("🎉 (PRECHECK-TEST-3) PAYROLL POLICY ENFORCEMENT WORKING!");
  }

  // Print all collected transaction hashes
  console.log("\n" + "=".repeat(50));
  console.log("📋 SUMMARY: COLLECTED TRANSACTION HASHES");
  console.log("=".repeat(50));

  if (transactionHashes.length > 0) {
    transactionHashes.forEach((hash, index) => {
      console.log(`${index + 1}. ${hash}`);
    });
    console.log(
      `\n✅ Total successful payroll transactions: ${transactionHashes.length}`
    );
  } else {
    console.log("❌ No transaction hashes collected");
  }

  console.log("=".repeat(50));

  process.exit();
})();
