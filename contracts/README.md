# Cookie Jar Smart Contracts

A decentralized protocol for controlled fund withdrawals with support for both whitelist and NFT-gated access modes. The protocol enables users to create "cookie jars" - smart contracts that manage deposits and withdrawals with configurable rules and fee mechanisms.

## Features

- **Flexible Access Control**: Support for both whitelist and NFT-gated access modes
- **Configurable Withdrawals**: Fixed or variable withdrawal amounts with customizable intervals
- **Multi-Token Support**: Handle both ETH and ERC20 tokens
- **Fee Mechanism**: 1% fee on deposits for protocol sustainability
- **Emergency Controls**: Optional emergency withdrawal functionality
- **Purpose Tracking**: Optional requirement for withdrawal purpose documentation

## Deployments

- CookieJarRegistry deployed on:
  - Base Sepolia: https://base-sepolia.blockscout.com/address/0xE9c62c210E6d56EbB0718f79DCE2883b8e38B356?tab=contract
  - Celo Alfajores: https://celo-alfajores.blockscout.com/address/0x8FF4E393D983fb2EEdCfcFcB55a0aaB9250d0AE6?tab=contract
- CookieJarFactory deployed on:
  - Base Sepolia: https://base-sepolia.blockscout.com/address/0x010CE87d0E7F8E818805a27C95E09cb4961C8c6f?tab=contract
  - Celo Alfajores: https://celo-alfajores.blockscout.com/address/0x5FC650F378475d1fF0E608964529E4863A339CD2?tab=contract

## Smart Contract Architecture

### Core Contracts

1. **CookieJarFactory**

   - Handles protocol access control
   - Manages jar deployments
   - Controls minimum deposit requirements
   - Maintains protocol-level blacklist

2. **CookieJar**

   - Manages individual jar logic
   - Handles deposits and withdrawals
   - Implements access control rules
   - Processes withdrawal requests

3. **CookieJarRegistry**

   - Stores all deployed jar data
   - Maintains jar metadata
   - Provides jar lookup functionality

4. **CookieJarLib**
   - Contains shared data structures
   - Defines common types and events
   - Implements reusable functions

## Setup and Development

### Prerequisites

- [Foundry](https://book.getfoundry.sh/)
- Ethereum wallet with test ETH (for deployment)

### Installation

```shell
# Clone the repository
git clone <repository-url>
cd cookie-jar-v2/contracts

# Install dependencies
# foundry-rs/forge-std
# OpenZeppelin/openzeppelin-contracts
forge install
```

### Build

```shell
forge build
```

### Test

```shell
forge test
```

### Format

```shell
forge fmt
```

### Deployment

1. Set up your environment variables:

```shell
cp .env.sample .env
vim .env
```

2. Deploy and verify:

```shell
./deploy.sh
```

## Changes Since Last Release

### Code Quality & Standards

- Implemented consistent natspec documentation across all contracts
- Integrated OpenZeppelin's Role-Based Access Control
- Updated error naming convention to include contract names for easier debugging
- Added comprehensive getters for improved contract interaction

### Architecture Improvements

- Streamlined data storage by consolidating jar data in the Registry
- Implemented OpenZeppelin's Ownable pattern across contracts
- Enhanced security with additional validation checks
- Separated ETH and ERC20 jar creation functions for better clarity

### Feature Enhancements

- Added configurable fee percentage in jar constructor
- Implemented support for multiple ERC20 tokens
- Enhanced deposit tracking mechanism
- Added withdrawal history tracking
- Improved fee calculation logic with 1% fee on all deposit transactions

### Testing & Documentation

- Restructured test suite for better coverage
- Created CookieJarLibrary for shared functionality
- Added comprehensive documentation for all features
- Implemented helper configurations for testing

## Documentation

For detailed documentation about Foundry's capabilities, visit the [Foundry Book](https://book.getfoundry.sh/).

## Security

- Do not send funds directly to the factory contract
- Always use the provided deposit functions
- Verify contract addresses before interaction
- Review withdrawal rules and access controls before deployment

fix emergency withdrawal
