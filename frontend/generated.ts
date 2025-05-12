import {
  createUseReadContract,
  createUseWriteContract,
  createUseSimulateContract,
  createUseWatchContractEvent,
} from 'wagmi/codegen'

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CookieJar
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cookieJarAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_jarOwner', internalType: 'address', type: 'address' },
      { name: '_supportedCurrency', internalType: 'address', type: 'address' },
      {
        name: '_accessType',
        internalType: 'enum CookieJarLib.AccessType',
        type: 'uint8',
      },
      { name: '_nftAddresses', internalType: 'address[]', type: 'address[]' },
      { name: '_nftTypes', internalType: 'uint8[]', type: 'uint8[]' },
      {
        name: '_withdrawalOption',
        internalType: 'enum CookieJarLib.WithdrawalTypeOptions',
        type: 'uint8',
      },
      { name: '_fixedAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_maxWithdrawal', internalType: 'uint256', type: 'uint256' },
      { name: '_withdrawalInterval', internalType: 'uint256', type: 'uint256' },
      { name: '_minDeposit', internalType: 'uint256', type: 'uint256' },
      {
        name: '_feePercentageOnDeposit',
        internalType: 'uint256',
        type: 'uint256',
      },
      { name: '_strictPurpose', internalType: 'bool', type: 'bool' },
      {
        name: '_defaultFeeCollector',
        internalType: 'address',
        type: 'address',
      },
      {
        name: '_emergencyWithdrawalEnabled',
        internalType: 'bool',
        type: 'bool',
      },
      { name: '_oneTimeWithdrawal', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'fallback', stateMutability: 'payable' },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'accessType',
    outputs: [
      { name: '', internalType: 'enum CookieJarLib.AccessType', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_nftAddress', internalType: 'address', type: 'address' },
      { name: '_nftType', internalType: 'uint8', type: 'uint8' },
    ],
    name: 'addNFTGate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currency',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'currencyHeldByJar',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'depositCurrency',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'depositETH',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'emergencyWithdrawCurrencyWithState',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'token', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'emergencyWithdrawWithoutState',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'emergencyWithdrawalEnabled',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feeCollector',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'feePercentageOnDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'fixedAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getNFTGatesArray',
    outputs: [
      {
        name: '',
        internalType: 'struct CookieJarLib.NFTGate[]',
        type: 'tuple[]',
        components: [
          { name: 'nftAddress', internalType: 'address', type: 'address' },
          {
            name: 'nftType',
            internalType: 'enum CookieJarLib.NFTType',
            type: 'uint8',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getWhitelist',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getWithdrawalDataArray',
    outputs: [
      {
        name: '',
        internalType: 'struct CookieJarLib.WithdrawalData[]',
        type: 'tuple[]',
        components: [
          { name: 'amount', internalType: 'uint256', type: 'uint256' },
          { name: 'purpose', internalType: 'string', type: 'string' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_users', internalType: 'address[]', type: 'address[]' }],
    name: 'grantJarWhitelistRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isWithdrawnByUser',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    name: 'lastWithdrawalNFT',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'lastWithdrawalWhitelist',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'maxWithdrawal',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'nftGates',
    outputs: [
      { name: 'nftAddress', internalType: 'address', type: 'address' },
      {
        name: 'nftType',
        internalType: 'enum CookieJarLib.NFTType',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'oneTimeWithdrawal',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_nftAddress', internalType: 'address', type: 'address' }],
    name: 'removeNFTGate',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_users', internalType: 'address[]', type: 'address[]' }],
    name: 'revokeJarWhitelistRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'strictPurpose',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_newFeeCollector', internalType: 'address', type: 'address' },
    ],
    name: 'updateFeeCollector',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'whitelist',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'purpose', internalType: 'string', type: 'string' },
      { name: 'gateAddress', internalType: 'address', type: 'address' },
      { name: 'tokenId', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawNFTMode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'purpose', internalType: 'string', type: 'string' },
    ],
    name: 'withdrawWhitelistMode',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'withdrawalData',
    outputs: [
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'purpose', internalType: 'string', type: 'string' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawalInterval',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawalOption',
    outputs: [
      {
        name: '',
        internalType: 'enum CookieJarLib.WithdrawalTypeOptions',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Deposit',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'admin',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'EmergencyWithdrawal',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'oldFeeCollector',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newFeeCollector',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'FeeCollectorUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'nftAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'nftType', internalType: 'uint8', type: 'uint8', indexed: false },
    ],
    name: 'NFTGateAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'nftAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'NFTGateRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'users',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
      { name: 'statuses', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'WhitelistUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'purpose',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
      {
        name: 'token',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'Withdrawal',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'AdminCannotBeZeroAddress' },
  { type: 'error', inputs: [], name: 'CookieJar__WithdrawalAlreadyDone' },
  { type: 'error', inputs: [], name: 'DuplicateNFTGate' },
  { type: 'error', inputs: [], name: 'EmergencyWithdrawalDisabled' },
  { type: 'error', inputs: [], name: 'FeeCollectorAddressCannotBeZeroAddress' },
  { type: 'error', inputs: [], name: 'FeeTransferFailed' },
  { type: 'error', inputs: [], name: 'InsufficientBalance' },
  { type: 'error', inputs: [], name: 'InvalidAccessType' },
  { type: 'error', inputs: [], name: 'InvalidNFTGate' },
  { type: 'error', inputs: [], name: 'InvalidNFTType' },
  { type: 'error', inputs: [], name: 'InvalidPurpose' },
  { type: 'error', inputs: [], name: 'InvalidTokenAddress' },
  { type: 'error', inputs: [], name: 'LessThanMinimumDeposit' },
  { type: 'error', inputs: [], name: 'NFTArrayLengthMismatch' },
  { type: 'error', inputs: [], name: 'NFTGateNotFound' },
  { type: 'error', inputs: [], name: 'NoNFTAddressesProvided' },
  { type: 'error', inputs: [], name: 'NotAuthorized' },
  { type: 'error', inputs: [], name: 'NotFeeCollector' },
  {
    type: 'error',
    inputs: [{ name: 'token', internalType: 'address', type: 'address' }],
    name: 'SafeERC20FailedOperation',
  },
  {
    type: 'error',
    inputs: [
      { name: 'requested', internalType: 'uint256', type: 'uint256' },
      { name: 'allowed', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'WithdrawalAmountNotAllowed',
  },
  {
    type: 'error',
    inputs: [{ name: 'nextAllowed', internalType: 'uint256', type: 'uint256' }],
    name: 'WithdrawalTooSoon',
  },
  { type: 'error', inputs: [], name: 'ZeroWithdrawal' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CookieJarFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cookieJarFactoryAbi = [
  {
    type: 'constructor',
    inputs: [
      {
        name: '_defaultFeeCollector',
        internalType: 'address',
        type: 'address',
      },
      { name: '_owner', internalType: 'address', type: 'address' },
      { name: '_feePercentage', internalType: 'uint256', type: 'uint256' },
      { name: '_minETHDeposit', internalType: 'uint256', type: 'uint256' },
      { name: '_minERC20Deposit', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'BLACKLISTED_JAR_CREATORS',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'DEFAULT_ADMIN_ROLE',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'OWNER',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'PROTOCOL_ADMIN',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'cookieJars',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_cookieJarOwner', internalType: 'address', type: 'address' },
      { name: '_supportedCurrency', internalType: 'address', type: 'address' },
      {
        name: '_accessType',
        internalType: 'enum CookieJarLib.AccessType',
        type: 'uint8',
      },
      { name: '_nftAddresses', internalType: 'address[]', type: 'address[]' },
      { name: '_nftTypes', internalType: 'uint8[]', type: 'uint8[]' },
      {
        name: '_withdrawalOption',
        internalType: 'enum CookieJarLib.WithdrawalTypeOptions',
        type: 'uint8',
      },
      { name: '_fixedAmount', internalType: 'uint256', type: 'uint256' },
      { name: '_maxWithdrawal', internalType: 'uint256', type: 'uint256' },
      { name: '_withdrawalInterval', internalType: 'uint256', type: 'uint256' },
      { name: '_strictPurpose', internalType: 'bool', type: 'bool' },
      {
        name: '_emergencyWithdrawalEnabled',
        internalType: 'bool',
        type: 'bool',
      },
      { name: '_oneTimeWithdrawal', internalType: 'bool', type: 'bool' },
      { name: 'metadata', internalType: 'string', type: 'string' },
    ],
    name: 'createCookieJar',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultFeeCollector',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'defaultFeePercentage',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCookieJars',
    outputs: [{ name: '', internalType: 'address[]', type: 'address[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'role', internalType: 'bytes32', type: 'bytes32' }],
    name: 'getRoleAdmin',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_users', internalType: 'address[]', type: 'address[]' }],
    name: 'grantBlacklistedJarCreatorsRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_admin', internalType: 'address', type: 'address' }],
    name: 'grantProtocolAdminRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'grantRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'hasRole',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minERC20Deposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'minETHDeposit',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callerConfirmation', internalType: 'address', type: 'address' },
    ],
    name: 'renounceRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_users', internalType: 'address[]', type: 'address[]' }],
    name: 'revokeBlacklistedJarCreatorsRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '_admin', internalType: 'address', type: 'address' }],
    name: 'revokeProtocolAdminRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32' },
      { name: 'account', internalType: 'address', type: 'address' },
    ],
    name: 'revokeRole',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'interfaceId', internalType: 'bytes4', type: 'bytes4' }],
    name: 'supportsInterface',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_newOwner', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'users',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
    ],
    name: 'BlacklistRoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'creator',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'cookieJarAddress',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'metadata',
        internalType: 'string',
        type: 'string',
        indexed: false,
      },
    ],
    name: 'CookieJarCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previousOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'newOwner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'previous',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'current',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'ProtocolAdminUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'previousAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'newAdminRole',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
    ],
    name: 'RoleAdminChanged',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleGranted',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'role', internalType: 'bytes32', type: 'bytes32', indexed: true },
      {
        name: 'account',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RoleRevoked',
  },
  { type: 'error', inputs: [], name: 'AccessControlBadConfirmation' },
  {
    type: 'error',
    inputs: [
      { name: 'account', internalType: 'address', type: 'address' },
      { name: 'neededRole', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'AccessControlUnauthorizedAccount',
  },
  { type: 'error', inputs: [], name: 'CookieJarFactory__Blacklisted' },
  {
    type: 'error',
    inputs: [],
    name: 'CookieJarFactory__LessThanMinimumDeposit',
  },
  {
    type: 'error',
    inputs: [],
    name: 'CookieJarFactory__MismatchedArrayLengths',
  },
  { type: 'error', inputs: [], name: 'CookieJarFactory__NotAuthorized' },
  { type: 'error', inputs: [], name: 'CookieJarFactory__NotFeeCollector' },
  {
    type: 'error',
    inputs: [],
    name: 'CookieJarFactory__NotSufficientAllowance',
  },
  { type: 'error', inputs: [], name: 'CookieJarFactory__NotValidERC20' },
  { type: 'error', inputs: [], name: 'CookieJarFactory__TransferFailed' },
  { type: 'error', inputs: [], name: 'CookieJarFactory__UserIsNotBlacklisted' },
  {
    type: 'error',
    inputs: [],
    name: 'CookieJarFactory__WithdrawingMoreThanDeposited',
  },
  { type: 'error', inputs: [], name: 'FeeCollectorAddressCannotBeZeroAddress' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CookieJarRegistry
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const cookieJarRegistryAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'cookieJarFactory',
    outputs: [
      { name: '', internalType: 'contract CookieJarFactory', type: 'address' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getAllJars',
    outputs: [
      {
        name: '',
        internalType: 'struct CookieJarRegistry.CookieJarInfo[]',
        type: 'tuple[]',
        components: [
          { name: 'jarAddress', internalType: 'address', type: 'address' },
          { name: 'currency', internalType: 'address', type: 'address' },
          { name: 'jarCreator', internalType: 'address', type: 'address' },
          { name: 'metadata', internalType: 'string', type: 'string' },
          {
            name: 'registrationTime',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'accessType',
            internalType: 'enum CookieJarLib.AccessType',
            type: 'uint8',
          },
          {
            name: 'nftGates',
            internalType: 'struct CookieJarLib.NFTGate[]',
            type: 'tuple[]',
            components: [
              { name: 'nftAddress', internalType: 'address', type: 'address' },
              {
                name: 'nftType',
                internalType: 'enum CookieJarLib.NFTType',
                type: 'uint8',
              },
            ],
          },
          {
            name: 'withdrawalOption',
            internalType: 'enum CookieJarLib.WithdrawalTypeOptions',
            type: 'uint8',
          },
          { name: 'fixedAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'maxWithdrawal', internalType: 'uint256', type: 'uint256' },
          {
            name: 'withdrawalInterval',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'strictPurpose', internalType: 'bool', type: 'bool' },
          {
            name: 'emergencyWithdrawalEnabled',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'oneTimeWithdrawal', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_jarCreator', internalType: 'address', type: 'address' }],
    name: 'getJarByCreatorAddress',
    outputs: [
      {
        name: '',
        internalType: 'struct CookieJarRegistry.CookieJarInfo',
        type: 'tuple',
        components: [
          { name: 'jarAddress', internalType: 'address', type: 'address' },
          { name: 'currency', internalType: 'address', type: 'address' },
          { name: 'jarCreator', internalType: 'address', type: 'address' },
          { name: 'metadata', internalType: 'string', type: 'string' },
          {
            name: 'registrationTime',
            internalType: 'uint256',
            type: 'uint256',
          },
          {
            name: 'accessType',
            internalType: 'enum CookieJarLib.AccessType',
            type: 'uint8',
          },
          {
            name: 'nftGates',
            internalType: 'struct CookieJarLib.NFTGate[]',
            type: 'tuple[]',
            components: [
              { name: 'nftAddress', internalType: 'address', type: 'address' },
              {
                name: 'nftType',
                internalType: 'enum CookieJarLib.NFTType',
                type: 'uint8',
              },
            ],
          },
          {
            name: 'withdrawalOption',
            internalType: 'enum CookieJarLib.WithdrawalTypeOptions',
            type: 'uint8',
          },
          { name: 'fixedAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'maxWithdrawal', internalType: 'uint256', type: 'uint256' },
          {
            name: 'withdrawalInterval',
            internalType: 'uint256',
            type: 'uint256',
          },
          { name: 'strictPurpose', internalType: 'bool', type: 'bool' },
          {
            name: 'emergencyWithdrawalEnabled',
            internalType: 'bool',
            type: 'bool',
          },
          { name: 'oneTimeWithdrawal', internalType: 'bool', type: 'bool' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getRegisteredCookieJarsCount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'jarCreatorToJar',
    outputs: [
      { name: 'jarAddress', internalType: 'address', type: 'address' },
      { name: 'currency', internalType: 'address', type: 'address' },
      { name: 'jarCreator', internalType: 'address', type: 'address' },
      { name: 'metadata', internalType: 'string', type: 'string' },
      { name: 'registrationTime', internalType: 'uint256', type: 'uint256' },
      {
        name: 'accessType',
        internalType: 'enum CookieJarLib.AccessType',
        type: 'uint8',
      },
      {
        name: 'withdrawalOption',
        internalType: 'enum CookieJarLib.WithdrawalTypeOptions',
        type: 'uint8',
      },
      { name: 'fixedAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'maxWithdrawal', internalType: 'uint256', type: 'uint256' },
      { name: 'withdrawalInterval', internalType: 'uint256', type: 'uint256' },
      { name: 'strictPurpose', internalType: 'bool', type: 'bool' },
      {
        name: 'emergencyWithdrawalEnabled',
        internalType: 'bool',
        type: 'bool',
      },
      { name: 'oneTimeWithdrawal', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_jarInstance',
        internalType: 'contract CookieJar',
        type: 'address',
      },
      { name: '_metadata', internalType: 'string', type: 'string' },
    ],
    name: 'registerAndStoreCookieJar',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'registeredCookieJars',
    outputs: [
      { name: 'jarAddress', internalType: 'address', type: 'address' },
      { name: 'currency', internalType: 'address', type: 'address' },
      { name: 'jarCreator', internalType: 'address', type: 'address' },
      { name: 'metadata', internalType: 'string', type: 'string' },
      { name: 'registrationTime', internalType: 'uint256', type: 'uint256' },
      {
        name: 'accessType',
        internalType: 'enum CookieJarLib.AccessType',
        type: 'uint8',
      },
      {
        name: 'withdrawalOption',
        internalType: 'enum CookieJarLib.WithdrawalTypeOptions',
        type: 'uint8',
      },
      { name: 'fixedAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'maxWithdrawal', internalType: 'uint256', type: 'uint256' },
      { name: 'withdrawalInterval', internalType: 'uint256', type: 'uint256' },
      { name: 'strictPurpose', internalType: 'bool', type: 'bool' },
      {
        name: 'emergencyWithdrawalEnabled',
        internalType: 'bool',
        type: 'bool',
      },
      { name: 'oneTimeWithdrawal', internalType: 'bool', type: 'bool' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_factory', internalType: 'address', type: 'address' }],
    name: 'setCookieJarFactory',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'factory',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CookieJarFactorySet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'jarInstance',
        internalType: 'contract CookieJar',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CookieJarRegistered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      { name: 'status', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'GlobalBlacklistUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'user', internalType: 'address', type: 'address', indexed: true },
      { name: 'status', internalType: 'bool', type: 'bool', indexed: false },
    ],
    name: 'GlobalWhitelistUpdated',
  },
  { type: 'error', inputs: [], name: 'CookieJarRegistry__FactoryAlreadySet' },
  { type: 'error', inputs: [], name: 'CookieJarRegistry__NotOwner' },
  { type: 'error', inputs: [], name: 'CookieJarRegistry__NotValidJarAddress' },
  { type: 'error', inputs: [], name: 'CookieJarRegistry__OnlyFactoryCanCall' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// erc20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: 'event',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'spender', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    inputs: [
      { name: 'from', type: 'address', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'value', type: 'uint256', indexed: false },
    ],
    name: 'Transfer',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'sender', type: 'address' },
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__
 */
export const useReadCookieJar = /*#__PURE__*/ createUseReadContract({
  abi: cookieJarAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadCookieJarDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"accessType"`
 */
export const useReadCookieJarAccessType = /*#__PURE__*/ createUseReadContract({
  abi: cookieJarAbi,
  functionName: 'accessType',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"currency"`
 */
export const useReadCookieJarCurrency = /*#__PURE__*/ createUseReadContract({
  abi: cookieJarAbi,
  functionName: 'currency',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"currencyHeldByJar"`
 */
export const useReadCookieJarCurrencyHeldByJar =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'currencyHeldByJar',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"emergencyWithdrawalEnabled"`
 */
export const useReadCookieJarEmergencyWithdrawalEnabled =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'emergencyWithdrawalEnabled',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"feeCollector"`
 */
export const useReadCookieJarFeeCollector = /*#__PURE__*/ createUseReadContract(
  { abi: cookieJarAbi, functionName: 'feeCollector' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"feePercentageOnDeposit"`
 */
export const useReadCookieJarFeePercentageOnDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'feePercentageOnDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"fixedAmount"`
 */
export const useReadCookieJarFixedAmount = /*#__PURE__*/ createUseReadContract({
  abi: cookieJarAbi,
  functionName: 'fixedAmount',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"getNFTGatesArray"`
 */
export const useReadCookieJarGetNftGatesArray =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'getNFTGatesArray',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadCookieJarGetRoleAdmin = /*#__PURE__*/ createUseReadContract(
  { abi: cookieJarAbi, functionName: 'getRoleAdmin' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"getWhitelist"`
 */
export const useReadCookieJarGetWhitelist = /*#__PURE__*/ createUseReadContract(
  { abi: cookieJarAbi, functionName: 'getWhitelist' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"getWithdrawalDataArray"`
 */
export const useReadCookieJarGetWithdrawalDataArray =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'getWithdrawalDataArray',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadCookieJarHasRole = /*#__PURE__*/ createUseReadContract({
  abi: cookieJarAbi,
  functionName: 'hasRole',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"isWithdrawnByUser"`
 */
export const useReadCookieJarIsWithdrawnByUser =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'isWithdrawnByUser',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"lastWithdrawalNFT"`
 */
export const useReadCookieJarLastWithdrawalNft =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'lastWithdrawalNFT',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"lastWithdrawalWhitelist"`
 */
export const useReadCookieJarLastWithdrawalWhitelist =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'lastWithdrawalWhitelist',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"maxWithdrawal"`
 */
export const useReadCookieJarMaxWithdrawal =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'maxWithdrawal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"minDeposit"`
 */
export const useReadCookieJarMinDeposit = /*#__PURE__*/ createUseReadContract({
  abi: cookieJarAbi,
  functionName: 'minDeposit',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"nftGates"`
 */
export const useReadCookieJarNftGates = /*#__PURE__*/ createUseReadContract({
  abi: cookieJarAbi,
  functionName: 'nftGates',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"oneTimeWithdrawal"`
 */
export const useReadCookieJarOneTimeWithdrawal =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'oneTimeWithdrawal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"strictPurpose"`
 */
export const useReadCookieJarStrictPurpose =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'strictPurpose',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadCookieJarSupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"whitelist"`
 */
export const useReadCookieJarWhitelist = /*#__PURE__*/ createUseReadContract({
  abi: cookieJarAbi,
  functionName: 'whitelist',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"withdrawalData"`
 */
export const useReadCookieJarWithdrawalData =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'withdrawalData',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"withdrawalInterval"`
 */
export const useReadCookieJarWithdrawalInterval =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'withdrawalInterval',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"withdrawalOption"`
 */
export const useReadCookieJarWithdrawalOption =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarAbi,
    functionName: 'withdrawalOption',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__
 */
export const useWriteCookieJar = /*#__PURE__*/ createUseWriteContract({
  abi: cookieJarAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"addNFTGate"`
 */
export const useWriteCookieJarAddNftGate = /*#__PURE__*/ createUseWriteContract(
  { abi: cookieJarAbi, functionName: 'addNFTGate' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"depositCurrency"`
 */
export const useWriteCookieJarDepositCurrency =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarAbi,
    functionName: 'depositCurrency',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"depositETH"`
 */
export const useWriteCookieJarDepositEth = /*#__PURE__*/ createUseWriteContract(
  { abi: cookieJarAbi, functionName: 'depositETH' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"emergencyWithdrawCurrencyWithState"`
 */
export const useWriteCookieJarEmergencyWithdrawCurrencyWithState =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarAbi,
    functionName: 'emergencyWithdrawCurrencyWithState',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"emergencyWithdrawWithoutState"`
 */
export const useWriteCookieJarEmergencyWithdrawWithoutState =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarAbi,
    functionName: 'emergencyWithdrawWithoutState',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"grantJarWhitelistRole"`
 */
export const useWriteCookieJarGrantJarWhitelistRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarAbi,
    functionName: 'grantJarWhitelistRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteCookieJarGrantRole = /*#__PURE__*/ createUseWriteContract({
  abi: cookieJarAbi,
  functionName: 'grantRole',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"removeNFTGate"`
 */
export const useWriteCookieJarRemoveNftGate =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarAbi,
    functionName: 'removeNFTGate',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteCookieJarRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"revokeJarWhitelistRole"`
 */
export const useWriteCookieJarRevokeJarWhitelistRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarAbi,
    functionName: 'revokeJarWhitelistRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteCookieJarRevokeRole = /*#__PURE__*/ createUseWriteContract(
  { abi: cookieJarAbi, functionName: 'revokeRole' },
)

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"updateFeeCollector"`
 */
export const useWriteCookieJarUpdateFeeCollector =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarAbi,
    functionName: 'updateFeeCollector',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"withdrawNFTMode"`
 */
export const useWriteCookieJarWithdrawNftMode =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarAbi,
    functionName: 'withdrawNFTMode',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"withdrawWhitelistMode"`
 */
export const useWriteCookieJarWithdrawWhitelistMode =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarAbi,
    functionName: 'withdrawWhitelistMode',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__
 */
export const useSimulateCookieJar = /*#__PURE__*/ createUseSimulateContract({
  abi: cookieJarAbi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"addNFTGate"`
 */
export const useSimulateCookieJarAddNftGate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'addNFTGate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"depositCurrency"`
 */
export const useSimulateCookieJarDepositCurrency =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'depositCurrency',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"depositETH"`
 */
export const useSimulateCookieJarDepositEth =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'depositETH',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"emergencyWithdrawCurrencyWithState"`
 */
export const useSimulateCookieJarEmergencyWithdrawCurrencyWithState =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'emergencyWithdrawCurrencyWithState',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"emergencyWithdrawWithoutState"`
 */
export const useSimulateCookieJarEmergencyWithdrawWithoutState =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'emergencyWithdrawWithoutState',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"grantJarWhitelistRole"`
 */
export const useSimulateCookieJarGrantJarWhitelistRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'grantJarWhitelistRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateCookieJarGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"removeNFTGate"`
 */
export const useSimulateCookieJarRemoveNftGate =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'removeNFTGate',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateCookieJarRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"revokeJarWhitelistRole"`
 */
export const useSimulateCookieJarRevokeJarWhitelistRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'revokeJarWhitelistRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateCookieJarRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"updateFeeCollector"`
 */
export const useSimulateCookieJarUpdateFeeCollector =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'updateFeeCollector',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"withdrawNFTMode"`
 */
export const useSimulateCookieJarWithdrawNftMode =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'withdrawNFTMode',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarAbi}__ and `functionName` set to `"withdrawWhitelistMode"`
 */
export const useSimulateCookieJarWithdrawWhitelistMode =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarAbi,
    functionName: 'withdrawWhitelistMode',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarAbi}__
 */
export const useWatchCookieJarEvent = /*#__PURE__*/ createUseWatchContractEvent(
  { abi: cookieJarAbi },
)

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarAbi}__ and `eventName` set to `"Deposit"`
 */
export const useWatchCookieJarDepositEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarAbi,
    eventName: 'Deposit',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarAbi}__ and `eventName` set to `"EmergencyWithdrawal"`
 */
export const useWatchCookieJarEmergencyWithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarAbi,
    eventName: 'EmergencyWithdrawal',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarAbi}__ and `eventName` set to `"FeeCollectorUpdated"`
 */
export const useWatchCookieJarFeeCollectorUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarAbi,
    eventName: 'FeeCollectorUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarAbi}__ and `eventName` set to `"NFTGateAdded"`
 */
export const useWatchCookieJarNftGateAddedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarAbi,
    eventName: 'NFTGateAdded',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarAbi}__ and `eventName` set to `"NFTGateRemoved"`
 */
export const useWatchCookieJarNftGateRemovedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarAbi,
    eventName: 'NFTGateRemoved',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchCookieJarRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchCookieJarRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchCookieJarRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarAbi}__ and `eventName` set to `"WhitelistUpdated"`
 */
export const useWatchCookieJarWhitelistUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarAbi,
    eventName: 'WhitelistUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarAbi}__ and `eventName` set to `"Withdrawal"`
 */
export const useWatchCookieJarWithdrawalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarAbi,
    eventName: 'Withdrawal',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__
 */
export const useReadCookieJarFactory = /*#__PURE__*/ createUseReadContract({
  abi: cookieJarFactoryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"BLACKLISTED_JAR_CREATORS"`
 */
export const useReadCookieJarFactoryBlacklistedJarCreators =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'BLACKLISTED_JAR_CREATORS',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadCookieJarFactoryDefaultAdminRole =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'DEFAULT_ADMIN_ROLE',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"OWNER"`
 */
export const useReadCookieJarFactoryOwner = /*#__PURE__*/ createUseReadContract(
  { abi: cookieJarFactoryAbi, functionName: 'OWNER' },
)

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"PROTOCOL_ADMIN"`
 */
export const useReadCookieJarFactoryProtocolAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'PROTOCOL_ADMIN',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"cookieJars"`
 */
export const useReadCookieJarFactoryCookieJars =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'cookieJars',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"defaultFeeCollector"`
 */
export const useReadCookieJarFactoryDefaultFeeCollector =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'defaultFeeCollector',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"defaultFeePercentage"`
 */
export const useReadCookieJarFactoryDefaultFeePercentage =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'defaultFeePercentage',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"getCookieJars"`
 */
export const useReadCookieJarFactoryGetCookieJars =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'getCookieJars',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadCookieJarFactoryGetRoleAdmin =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'getRoleAdmin',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadCookieJarFactoryHasRole =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'hasRole',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"minERC20Deposit"`
 */
export const useReadCookieJarFactoryMinErc20Deposit =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'minERC20Deposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"minETHDeposit"`
 */
export const useReadCookieJarFactoryMinEthDeposit =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'minETHDeposit',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadCookieJarFactorySupportsInterface =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarFactoryAbi,
    functionName: 'supportsInterface',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__
 */
export const useWriteCookieJarFactory = /*#__PURE__*/ createUseWriteContract({
  abi: cookieJarFactoryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"createCookieJar"`
 */
export const useWriteCookieJarFactoryCreateCookieJar =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarFactoryAbi,
    functionName: 'createCookieJar',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"grantBlacklistedJarCreatorsRole"`
 */
export const useWriteCookieJarFactoryGrantBlacklistedJarCreatorsRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarFactoryAbi,
    functionName: 'grantBlacklistedJarCreatorsRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"grantProtocolAdminRole"`
 */
export const useWriteCookieJarFactoryGrantProtocolAdminRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarFactoryAbi,
    functionName: 'grantProtocolAdminRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteCookieJarFactoryGrantRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarFactoryAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteCookieJarFactoryRenounceRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarFactoryAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"revokeBlacklistedJarCreatorsRole"`
 */
export const useWriteCookieJarFactoryRevokeBlacklistedJarCreatorsRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarFactoryAbi,
    functionName: 'revokeBlacklistedJarCreatorsRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"revokeProtocolAdminRole"`
 */
export const useWriteCookieJarFactoryRevokeProtocolAdminRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarFactoryAbi,
    functionName: 'revokeProtocolAdminRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteCookieJarFactoryRevokeRole =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarFactoryAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteCookieJarFactoryTransferOwnership =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__
 */
export const useSimulateCookieJarFactory =
  /*#__PURE__*/ createUseSimulateContract({ abi: cookieJarFactoryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"createCookieJar"`
 */
export const useSimulateCookieJarFactoryCreateCookieJar =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarFactoryAbi,
    functionName: 'createCookieJar',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"grantBlacklistedJarCreatorsRole"`
 */
export const useSimulateCookieJarFactoryGrantBlacklistedJarCreatorsRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarFactoryAbi,
    functionName: 'grantBlacklistedJarCreatorsRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"grantProtocolAdminRole"`
 */
export const useSimulateCookieJarFactoryGrantProtocolAdminRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarFactoryAbi,
    functionName: 'grantProtocolAdminRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateCookieJarFactoryGrantRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarFactoryAbi,
    functionName: 'grantRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateCookieJarFactoryRenounceRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarFactoryAbi,
    functionName: 'renounceRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"revokeBlacklistedJarCreatorsRole"`
 */
export const useSimulateCookieJarFactoryRevokeBlacklistedJarCreatorsRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarFactoryAbi,
    functionName: 'revokeBlacklistedJarCreatorsRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"revokeProtocolAdminRole"`
 */
export const useSimulateCookieJarFactoryRevokeProtocolAdminRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarFactoryAbi,
    functionName: 'revokeProtocolAdminRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateCookieJarFactoryRevokeRole =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarFactoryAbi,
    functionName: 'revokeRole',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateCookieJarFactoryTransferOwnership =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarFactoryAbi,
    functionName: 'transferOwnership',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarFactoryAbi}__
 */
export const useWatchCookieJarFactoryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: cookieJarFactoryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `eventName` set to `"BlacklistRoleGranted"`
 */
export const useWatchCookieJarFactoryBlacklistRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarFactoryAbi,
    eventName: 'BlacklistRoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `eventName` set to `"CookieJarCreated"`
 */
export const useWatchCookieJarFactoryCookieJarCreatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarFactoryAbi,
    eventName: 'CookieJarCreated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchCookieJarFactoryOwnershipTransferredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarFactoryAbi,
    eventName: 'OwnershipTransferred',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `eventName` set to `"ProtocolAdminUpdated"`
 */
export const useWatchCookieJarFactoryProtocolAdminUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarFactoryAbi,
    eventName: 'ProtocolAdminUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchCookieJarFactoryRoleAdminChangedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarFactoryAbi,
    eventName: 'RoleAdminChanged',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchCookieJarFactoryRoleGrantedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarFactoryAbi,
    eventName: 'RoleGranted',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarFactoryAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchCookieJarFactoryRoleRevokedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarFactoryAbi,
    eventName: 'RoleRevoked',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__
 */
export const useReadCookieJarRegistry = /*#__PURE__*/ createUseReadContract({
  abi: cookieJarRegistryAbi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `functionName` set to `"cookieJarFactory"`
 */
export const useReadCookieJarRegistryCookieJarFactory =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarRegistryAbi,
    functionName: 'cookieJarFactory',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `functionName` set to `"getAllJars"`
 */
export const useReadCookieJarRegistryGetAllJars =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarRegistryAbi,
    functionName: 'getAllJars',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `functionName` set to `"getJarByCreatorAddress"`
 */
export const useReadCookieJarRegistryGetJarByCreatorAddress =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarRegistryAbi,
    functionName: 'getJarByCreatorAddress',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `functionName` set to `"getRegisteredCookieJarsCount"`
 */
export const useReadCookieJarRegistryGetRegisteredCookieJarsCount =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarRegistryAbi,
    functionName: 'getRegisteredCookieJarsCount',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `functionName` set to `"jarCreatorToJar"`
 */
export const useReadCookieJarRegistryJarCreatorToJar =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarRegistryAbi,
    functionName: 'jarCreatorToJar',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `functionName` set to `"registeredCookieJars"`
 */
export const useReadCookieJarRegistryRegisteredCookieJars =
  /*#__PURE__*/ createUseReadContract({
    abi: cookieJarRegistryAbi,
    functionName: 'registeredCookieJars',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__
 */
export const useWriteCookieJarRegistry = /*#__PURE__*/ createUseWriteContract({
  abi: cookieJarRegistryAbi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `functionName` set to `"registerAndStoreCookieJar"`
 */
export const useWriteCookieJarRegistryRegisterAndStoreCookieJar =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarRegistryAbi,
    functionName: 'registerAndStoreCookieJar',
  })

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `functionName` set to `"setCookieJarFactory"`
 */
export const useWriteCookieJarRegistrySetCookieJarFactory =
  /*#__PURE__*/ createUseWriteContract({
    abi: cookieJarRegistryAbi,
    functionName: 'setCookieJarFactory',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__
 */
export const useSimulateCookieJarRegistry =
  /*#__PURE__*/ createUseSimulateContract({ abi: cookieJarRegistryAbi })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `functionName` set to `"registerAndStoreCookieJar"`
 */
export const useSimulateCookieJarRegistryRegisterAndStoreCookieJar =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarRegistryAbi,
    functionName: 'registerAndStoreCookieJar',
  })

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `functionName` set to `"setCookieJarFactory"`
 */
export const useSimulateCookieJarRegistrySetCookieJarFactory =
  /*#__PURE__*/ createUseSimulateContract({
    abi: cookieJarRegistryAbi,
    functionName: 'setCookieJarFactory',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarRegistryAbi}__
 */
export const useWatchCookieJarRegistryEvent =
  /*#__PURE__*/ createUseWatchContractEvent({ abi: cookieJarRegistryAbi })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `eventName` set to `"CookieJarFactorySet"`
 */
export const useWatchCookieJarRegistryCookieJarFactorySetEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarRegistryAbi,
    eventName: 'CookieJarFactorySet',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `eventName` set to `"CookieJarRegistered"`
 */
export const useWatchCookieJarRegistryCookieJarRegisteredEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarRegistryAbi,
    eventName: 'CookieJarRegistered',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `eventName` set to `"GlobalBlacklistUpdated"`
 */
export const useWatchCookieJarRegistryGlobalBlacklistUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarRegistryAbi,
    eventName: 'GlobalBlacklistUpdated',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link cookieJarRegistryAbi}__ and `eventName` set to `"GlobalWhitelistUpdated"`
 */
export const useWatchCookieJarRegistryGlobalWhitelistUpdatedEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: cookieJarRegistryAbi,
    eventName: 'GlobalWhitelistUpdated',
  })

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useReadErc20 = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"allowance"`
 */
export const useReadErc20Allowance = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'allowance',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"balanceOf"`
 */
export const useReadErc20BalanceOf = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'balanceOf',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"decimals"`
 */
export const useReadErc20Decimals = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'decimals',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"name"`
 */
export const useReadErc20Name = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'name',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"symbol"`
 */
export const useReadErc20Symbol = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'symbol',
})

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"totalSupply"`
 */
export const useReadErc20TotalSupply = /*#__PURE__*/ createUseReadContract({
  abi: erc20Abi,
  functionName: 'totalSupply',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWriteErc20 = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useWriteErc20Approve = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useWriteErc20Transfer = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transfer',
})

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useWriteErc20TransferFrom = /*#__PURE__*/ createUseWriteContract({
  abi: erc20Abi,
  functionName: 'transferFrom',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__
 */
export const useSimulateErc20 = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"approve"`
 */
export const useSimulateErc20Approve = /*#__PURE__*/ createUseSimulateContract({
  abi: erc20Abi,
  functionName: 'approve',
})

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transfer"`
 */
export const useSimulateErc20Transfer = /*#__PURE__*/ createUseSimulateContract(
  { abi: erc20Abi, functionName: 'transfer' },
)

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link erc20Abi}__ and `functionName` set to `"transferFrom"`
 */
export const useSimulateErc20TransferFrom =
  /*#__PURE__*/ createUseSimulateContract({
    abi: erc20Abi,
    functionName: 'transferFrom',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__
 */
export const useWatchErc20Event = /*#__PURE__*/ createUseWatchContractEvent({
  abi: erc20Abi,
})

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Approval"`
 */
export const useWatchErc20ApprovalEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Approval',
  })

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link erc20Abi}__ and `eventName` set to `"Transfer"`
 */
export const useWatchErc20TransferEvent =
  /*#__PURE__*/ createUseWatchContractEvent({
    abi: erc20Abi,
    eventName: 'Transfer',
  })
