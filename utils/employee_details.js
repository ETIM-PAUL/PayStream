
export const EMPLOYEE_CONTRACT_ADDRESS = "0x606CbC3D95E36c8b22bC671285154a722f25170E"
export const EMPLOYEE_CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "ECDSAInvalidSignature",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "length",
                "type": "uint256"
            }
        ],
        "name": "ECDSAInvalidSignatureLength",
        "type": "error"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "s",
                "type": "bytes32"
            }
        ],
        "name": "ECDSAInvalidSignatureS",
        "type": "error"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "companyId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "CompanyRegistered",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "companyId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "employeeId",
                "type": "uint256"
            }
        ],
        "name": "EmployeeAdded",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "companyId",
                "type": "uint256"
            },
            {
                "indexed": true,
                "internalType": "uint256",
                "name": "employeeId",
                "type": "uint256"
            }
        ],
        "name": "EmployeeUpdated",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "DOMAIN_SEPARATOR",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "PAYROLL_TYPEHASH",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "companyId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "employeeId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "wallet",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "position",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "salary",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "dob",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "dateOfEmployment",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "status",
                "type": "string"
            }
        ],
        "name": "addEmployee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "companies",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "logo",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "admin1",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "admin2",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "lastPaymentCycle",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "companiesByAddress",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "companyCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "employeeIndex",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "employeesByCompany",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "wallet",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "position",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "salary",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "dob",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "dateOfEmployment",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "status",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getCompaniesByAddress",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "logo",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "admin1",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "admin2",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "lastPaymentCycle",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct CompanyRegistry.Company[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "companyId",
                "type": "uint256"
            }
        ],
        "name": "getCompanyAdmins",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_company_id",
                "type": "uint256"
            }
        ],
        "name": "getCompanyDetails",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "logo",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "description",
                        "type": "string"
                    },
                    {
                        "internalType": "address",
                        "name": "owner",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "admin1",
                        "type": "address"
                    },
                    {
                        "internalType": "address",
                        "name": "admin2",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "lastPaymentCycle",
                        "type": "uint256"
                    }
                ],
                "internalType": "struct CompanyRegistry.Company",
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "companyId",
                "type": "uint256"
            }
        ],
        "name": "getCompanyEmployees",
        "outputs": [
            {
                "components": [
                    {
                        "internalType": "uint256",
                        "name": "id",
                        "type": "uint256"
                    },
                    {
                        "internalType": "address",
                        "name": "wallet",
                        "type": "address"
                    },
                    {
                        "internalType": "string",
                        "name": "position",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "salary",
                        "type": "uint256"
                    },
                    {
                        "internalType": "string",
                        "name": "dob",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "dateOfEmployment",
                        "type": "string"
                    },
                    {
                        "internalType": "string",
                        "name": "status",
                        "type": "string"
                    }
                ],
                "internalType": "struct CompanyRegistry.Employee[]",
                "name": "",
                "type": "tuple[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "logo",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "description",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "admin1",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "admin2",
                "type": "address"
            }
        ],
        "name": "registerCompany",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "companyId",
                "type": "uint256"
            }
        ],
        "name": "updateCompanyLastPaymetCycle",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "companyId",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "employeeId",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "position",
                "type": "string"
            },
            {
                "internalType": "uint256",
                "name": "salary",
                "type": "uint256"
            },
            {
                "internalType": "string",
                "name": "status",
                "type": "string"
            }
        ],
        "name": "updateEmployee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "usedNonces",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
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
]