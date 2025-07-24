import { createVincentPolicy } from "@lit-protocol/vincent-tool-sdk";
import {
  commitAllowResultSchema,
  commitDenyResultSchema,
  commitParamsSchema,
  evalAllowResultSchema,
  evalDenyResultSchema,
  precheckAllowResultSchema,
  precheckDenyResultSchema,
  toolParamsSchema,
  userParamsSchema,
  CommitParams,
} from "./schemas";
import { ethers } from "ethers";



let signatures = [];
const provider = new ethers.providers.JsonRpcProvider("https://yellowstone-rpc.litprotocol.com/", 175188);
const EMPLOYEE_CONTRACT_ABI = [
  {
      "inputs": [
          {
              "components": [
                  {
                      "internalType": "uint256",
                      "name": "companyId",
                      "type": "uint256"
                  },
                  {
                      "internalType": "string",
                      "name": "companyName",
                      "type": "string"
                  },
                  {
                      "internalType": "uint256",
                      "name": "numEmployees",
                      "type": "uint256"
                  },
                  {
                      "internalType": "address",
                      "name": "creatorAddress",
                      "type": "address"
                  },
                  {
                      "internalType": "string",
                      "name": "nonce",
                      "type": "string"
                  },
                  {
                      "internalType": "uint256",
                      "name": "expiry",
                      "type": "uint256"
                  }
              ],
              "internalType": "struct CompanyRegistry.PayrollApprovalMessage",
              "name": "msgData",
              "type": "tuple"
          },
          {
              "internalType": "bytes",
              "name": "sig1",
              "type": "bytes"
          },
          {
              "internalType": "bytes",
              "name": "sig2",
              "type": "bytes"
          }
      ],
      "name": "verifySignatures",
      "outputs": [
          {
              "internalType": "bool",
              "name": "",
              "type": "bool"
          }
      ],
      "stateMutability": "view",
      "type": "function"
  }
];
const EMPLOYEE_CONTRACT_ADDRESS = "0x606CbC3D95E36c8b22bC671285154a722f25170E";

const employeeContract = new ethers.Contract(
  EMPLOYEE_CONTRACT_ADDRESS,
  EMPLOYEE_CONTRACT_ABI,
  provider
  );
  
export const vincentPolicy = createVincentPolicy({
  packageName: "@agentic-ai/vincent-double_signature_policy" as const,

  toolParamsSchema,
  userParamsSchema,
  commitParamsSchema,

  precheckAllowResultSchema,
  precheckDenyResultSchema,

  evalAllowResultSchema,
  evalDenyResultSchema,

  commitAllowResultSchema,
  commitDenyResultSchema,


  precheck: async (
    { toolParams, userParams },
    { allow, deny }
  ) => {
    const allowed = [];
    const denied = [];

    if (!toolParams.employees || toolParams.employees.length === 0) {
      return deny({ reason: "Employee list is empty. Payroll cannot proceed." });
    }
    
    if (!toolParams.signatures || toolParams.signatures.length === 0) {
      return deny({ reason: "Company Admin Signature list is empty. Payroll cannot proceed." });
    }


    const isValid = await employeeContract.verifySignatures(
      {
        companyId: toolParams?.company?.id,
        companyName: toolParams?.company?.id,
        numEmployees: toolParams?.employees?.length,
        creatorAddress: toolParams?.company?.owner,
        nonce: 1,
        expiry: Math.floor(Date.now() / 1000) + 3600
      },
      toolParams?.signatures[0],
      toolParams?.signatures[1]
    );

    console.log("isValid",isValid)
    signatures = [
      {
      address: toolParams?.company[0]?.admin1,
      signature: toolParams?.signatures[0]
    },
      {
      address: toolParams?.company[0],
      signature: toolParams?.signatures[1]
    }
    ];
    
    if (!isValid) {
      return deny({ reason: "Invalid Signatures" });
    }

    return allow({ allowed, denied });
  },

  evaluate: async (
    { toolParams, userParams },
    { allow, deny }
  ) => {
    // Same logic as precheck for this policy
    const allowed = [];
    const denied = [];

    if (!toolParams.employees || toolParams.employees.length === 0) {
      return deny({ reason: "Employee list is empty. Payroll cannot proceed." });
    }
    
    if (!toolParams.signatures || toolParams.signatures.length === 0) {
      return deny({ reason: "Company Admin Signature list is empty. Payroll cannot proceed." });
    }

    const isValid = await employeeContract.verifySignatures(
      {
        companyId: toolParams?.company?.id,
        companyName: toolParams?.company?.id,
        numEmployees: toolParams?.employees?.length,
        creatorAddress: toolParams?.employees?.length,
        nonce: 1,
        expiry: Math.floor(Date.now() / 1000) + 3600
      },
      toolParams?.signatures[0],
      toolParams?.signatures[1]
    );

    console.log("isValid",isValid)
    
    if (isValid) {
      return deny({ reason: "Invalid Signatures" });
    }

    return allow({ allowed, denied });
  },

  commit: async (
    commitParams: CommitParams,
    { allow }
  ) => {
    const recorded = [];
    const now = Math.floor(Date.now() / 1000);
    for (const signature of commitParams.signatures) {
      recorded.push({ address: signature.address, paidAt: now });
    }
    return allow({recorded});
  },
});
