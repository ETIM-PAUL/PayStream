import {
  PARAMETER_TYPE,
  createAppConfig,
  init,
  suppressLitLogs,
} from "@lit-protocol/vincent-scaffold-sdk/e2e";
import { ethers } from "ethers";

suppressLitLogs(false);

import { getVincentToolClient } from "@lit-protocol/vincent-app-sdk";
// Payroll Tool and Policy
import { vincentPolicyMetadata as cycleStatusPolicyMetadata } from "../../vincent-packages/policies/cycle_status_policy/dist/index.js";
import { vincentPolicyMetadata as signaturePolicyMetadata } from "../../vincent-packages/policies/double_signature_policy/dist/index.js";
import { bundledVincentTool as payrollTool } from "../../vincent-packages/tools/payroll/dist/index.js";
import { EMPLOYEE_CONTRACT_ABI, EMPLOYEE_CONTRACT_ADDRESS } from "../../utils/employee_details.js";



const domain = {
    name: "CompanyAutomatedPayroll",
    version: "1",
    chainId: 1, // or your actual chainId
    verifyingContract: "0x606CbC3D95E36c8b22bC671285154a722f25170E"
  };
  
  const types = {
    PayrollApproval: [
      { name: "companyId", type: "string" },
      { name: "companyName", type: "string" },
      { name: "numEmployees", type: "uint256" },
      { name: "creatorAddress", type: "address" },
      { name: "nonce", type: "string" },
      { name: "expiry", type: "uint256" }
    ]
  };


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
        [cycleStatusPolicyMetadata.ipfsCid, signaturePolicyMetadata.ipfsCid], // Enable payroll policy for payroll tool
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
        [cycleStatusPolicyMetadata.ipfsCid]: "Cycle Status Policy",
        [signaturePolicyMetadata.ipfsCid]: "Signature Policy",
      },
      debug: true,
    }
  );

  const toolAndPolicyIpfsCids = [
    payrollTool.ipfsCid,
    cycleStatusPolicyMetadata.ipfsCid,
    signaturePolicyMetadata.ipfsCid,
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

  //fetch employees for a company
    async function fetchEmployees(provider: ethers.providers.Provider) {
        const contract = new ethers.Contract(
        EMPLOYEE_CONTRACT_ADDRESS,
        EMPLOYEE_CONTRACT_ABI,
        provider
        );
        const employees = await contract.getCompanyEmployees(1);
        return employees;
    }

    //fetch company details
    async function fetchCompanyDetails(provider: ethers.providers.Provider) {
        const contract = new ethers.Contract(
        EMPLOYEE_CONTRACT_ADDRESS,
        EMPLOYEE_CONTRACT_ABI,
        provider
        );
        const employees = await contract.getCompanyDetails(1);
        return employees;
    }

    const provider = new ethers.providers.JsonRpcProvider("https://yellowstone-rpc.litprotocol.com/", 175188);
    const employees = await fetchEmployees(provider);
    const company = await fetchCompanyDetails(provider);

    const formattedEmployees = employees.map(e => ({
        id: e.id.toString(), // or e[0].toString()
        address: e.wallet,
        position: e.position,
        salary: e.salary.toString(), // or e[3].toString()
        dob: e.dob, // as string, or convert to Date if needed
        dateOfEmployment: e.dateOfEmployment, // as string, or convert to Date if needed
        status: e.status
      }));
    
    const formattedCompany = {
      id: company.id.toString(), // or companyRaw[0].toString()
      owner: company.owner,
      admin1: company.admin1,
      admin2: company.admin2,
      lastPaymentCycle: company.lastPaymentCycle.toString() // or companyRaw[7].toString()
    };

  // Array to collect transaction hashes from successful executions
  const transactionHashes: string[] = [];
  const companyPayrollSigs: string[] = [];

  // 2. Load the admin's private key (NEVER expose this in production code)
  const privateKey:any = process.env.ADMIN1_PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey); 
  const privateKey2:any = process.env.ADMIN2_PRIVATE_KEY;
  const wallet2 = new ethers.Wallet(privateKey2); 
    
  const message = {
    companyId: company?.id,
    companyName: company?.name,
    numEmployees: formattedEmployees?.length,
    creatorAddress: company?.owner,
    nonce: 1,
    expiry: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
  };

  // 3. Sign the typed data (EIP-712)
  async function signTypedData1() {
  const signature = await wallet._signTypedData(domain, types, message);
  companyPayrollSigs.push(signature);
  }
  async function signTypedData2() {
  const signature = await wallet2._signTypedData(domain, types, message);
  companyPayrollSigs.push(signature);
  }

await signTypedData1();
await signTypedData2();

console.log("employees", formattedEmployees)
console.log("company", formattedCompany)
console.log("Signature:", companyPayrollSigs);

  const TEST_TOOL_PARAMS = {
    employees: formattedEmployees,
    tokenAddress: "0xF77025Db69882AD1c7f18D2A1C5B8821C091916C", // Base USDC Contract Address
    tokenDecimals: 18,
    rpcUrl: "https://yellowstone-rpc.litprotocol.com/",
    chainId: 175188,
    signatures: companyPayrollSigs,
    company: formattedCompany
  };

  const precheck = async () => {
    return await payrollToolClient.precheck(TEST_TOOL_PARAMS, {
    rpcUrl:"https://yellowstone-rpc.litprotocol.com/",
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
