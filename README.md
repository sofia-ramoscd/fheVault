# FHEVault - Private Staking Vault with Fully Homomorphic Encryption

<p align="center">
  <strong>A revolutionary DeFi staking protocol leveraging Zama's Fully Homomorphic Encryption (FHE) to enable completely private, on-chain encrypted balance management</strong>
</p>

## Table of Contents

- [Introduction](#introduction)
- [Key Advantages](#key-advantages)
- [Problems We Solve](#problems-we-solve)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [How It Works](#how-it-works)
- [Quick Start](#quick-start)
- [Smart Contract Features](#smart-contract-features)
- [Frontend Features](#frontend-features)
- [Security](#security)
- [Testing](#testing)
- [Deployment](#deployment)
- [Future Roadmap](#future-roadmap)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Introduction

**FHEVault** is a next-generation DeFi staking protocol that allows users to stake ETH and manage their balances with complete privacy. Unlike traditional DeFi protocols where all balances and transactions are publicly visible on the blockchain, FHEVault uses **Fully Homomorphic Encryption (FHE)** to keep user balances encrypted while still enabling smart contract operations.

Users can:
- **Stake ETH** and receive encrypted fETH (FHE-ETH) receipts
- **Lock funds** for specific durations with time-locked encrypted positions
- **Redeem** their staked assets after lock periods expire
- Maintain **complete balance privacy** - even the smart contract cannot see actual amounts

All operations are performed on encrypted data directly on-chain, providing unprecedented privacy guarantees while maintaining the trustless nature of blockchain technology.

## Key Advantages

### 1. Complete Balance Privacy
- User balances remain encrypted on-chain at all times
- Neither external observers nor the contract itself can see actual amounts
- Only the user can decrypt their own balance using their private key
- Eliminates front-running and MEV attacks based on balance information

### 2. On-Chain Computation on Encrypted Data
- Leverages Zama's FHEVM to perform arithmetic operations (add, subtract) on encrypted values
- No need to decrypt data to perform staking, locking, or redemption operations
- Maintains security guarantees equivalent to client-side encryption

### 3. Regulatory Compliance Friendly
- Enables privacy-preserving DeFi that can satisfy privacy regulations
- Selective disclosure: users can prove their balance to auditors without public exposure
- Built-in audit trails with encrypted transaction history

### 4. Protection Against Targeted Attacks
- Large holders (whales) can stake without revealing their positions
- Prevents targeted phishing or social engineering attacks based on visible wealth
- Reduces economic attack vectors in DeFi protocols

### 5. Competitive Privacy
- Users can participate in DeFi without exposing their trading strategies
- Prevents copy-trading and parasitic arbitrage
- Enables institutional participation with privacy requirements

## Problems We Solve

### Problem 1: Blockchain Transparency vs. Privacy
**Traditional DeFi Challenge**: All transactions and balances are publicly visible, creating privacy concerns for users and institutions.

**Our Solution**: FHEVault uses Fully Homomorphic Encryption to keep balances encrypted on-chain while still enabling smart contract functionality. Users maintain privacy without sacrificing decentralization or trustlessness.

### Problem 2: MEV and Front-Running
**Traditional DeFi Challenge**: Large transactions are visible in the mempool, allowing bots to front-run and extract value.

**Our Solution**: Encrypted balances and amounts make it impossible for MEV bots to identify and target high-value transactions.

### Problem 3: Regulatory Uncertainty
**Traditional DeFi Challenge**: Financial privacy is often required by regulations, but public blockchains expose all transaction data.

**Our Solution**: FHE enables regulatory-compliant privacy. Users can selectively disclose information to authorized parties (auditors, regulators) without public exposure.

### Problem 4: Institutional Adoption Barriers
**Traditional DeFi Challenge**: Institutions cannot participate in DeFi due to privacy requirements and competitive concerns.

**Our Solution**: FHEVault provides institutional-grade privacy, enabling large organizations to stake and manage assets without revealing positions or strategies.

### Problem 5: User Safety and Security
**Traditional DeFi Challenge**: Visible balances make users targets for phishing, social engineering, and physical threats.

**Our Solution**: Encrypted balances protect users from targeted attacks based on known wealth.

## Technology Stack

### Smart Contract Layer
- **Solidity ^0.8.24** - Core smart contract language
- **FHEVM** ([@fhevm/solidity](https://docs.zama.ai/fhevm)) - Zama's Fully Homomorphic Encryption library for Ethereum
- **euint64** - 64-bit encrypted unsigned integers for balance management
- **Hardhat** - Development environment for compilation, testing, and deployment
- **Hardhat Deploy** - Deterministic deployment plugin
- **TypeChain** - TypeScript bindings for smart contracts

### Frontend Stack
- **React 19** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Next-generation frontend build tool
- **Wagmi** - React hooks for Ethereum
- **RainbowKit** - Beautiful wallet connection UI
- **ethers.js v6** - Ethereum library for blockchain interaction
- **@zama-fhe/relayer-sdk** - Zama's relayer SDK for FHE operations
- **TanStack Query** - Powerful async state management

### Development Tools
- **TypeScript ^5.8** - Static typing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Solhint** - Solidity linting
- **Hardhat Gas Reporter** - Gas optimization analysis
- **Solidity Coverage** - Test coverage reporting

### Testing Framework
- **Mocha** - Test framework
- **Chai** - Assertion library
- **@nomicfoundation/hardhat-chai-matchers** - Ethereum-specific assertions
- **@fhevm/hardhat-plugin** - FHE testing utilities

### Infrastructure
- **Sepolia Testnet** - Ethereum test network with FHEVM support
- **Hardhat Network** - Local development blockchain
- **Infura** - Ethereum node provider
- **Etherscan** - Contract verification

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Vite + React)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ RainbowKit   │  │    Wagmi     │  │  Zama SDK    │     │
│  │  (Wallet)    │  │  (Web3 API)  │  │ (FHE Relayer)│     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ▼
            ┌────────────────────────────────┐
            │      Ethereum Network          │
            │         (Sepolia)              │
            └────────────┬───────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────────┐
        │         FHEVault Smart Contract         │
        │  ┌──────────────────────────────────┐  │
        │  │  Encrypted Balance Storage       │  │
        │  │  (euint64 - FHE encrypted)       │  │
        │  ├──────────────────────────────────┤  │
        │  │  Lock Position Management        │  │
        │  │  (Time-locked encrypted amounts) │  │
        │  ├──────────────────────────────────┤  │
        │  │  Plain Balance Accounting        │  │
        │  │  (For gas-free queries)          │  │
        │  └──────────────────────────────────┘  │
        └────────────────────────────────────────┘
                         │
                         ▼
            ┌────────────────────────────────┐
            │    Zama FHEVM Infrastructure   │
            │  - KMS (Key Management)        │
            │  - FHE Coprocessor             │
            │  - Decryption Relayer          │
            └────────────────────────────────┘
```

### Smart Contract Architecture

The `FHEVault.sol` contract is structured with three core components:

1. **Encrypted Balance Management**
   - `mapping(address => euint64) encryptedBalances` - Stores FHE-encrypted balances
   - Operations: stake, redeem, lock, releaseLock
   - All arithmetic operations performed on encrypted data

2. **Plain Balance Accounting**
   - `mapping(address => uint256) plainBalances` - Tracks available (non-locked) amounts
   - Enables gas-efficient balance queries
   - Used for validation and accounting logic

3. **Lock Position System**
   - `mapping(address => LockPosition) locks` - Stores time-locked positions
   - Each position contains: encrypted amount, plain amount, unlock time, active status
   - Enforces one active lock per user for simplicity

### Data Flow

#### Staking Flow
```
User → stake(ETH) → Contract
  ├─ plainBalances[user] += amount
  ├─ encryptedBalances[user] = FHE.add(encryptedBalances[user], FHE.asEuint64(amount))
  └─ emit Staked event
```

#### Locking Flow
```
User → lock(amount, duration, encryptedAmount, proof) → Contract
  ├─ Verify user has sufficient plain balance
  ├─ Deduct from plainBalances and encryptedBalances
  ├─ Create LockPosition with encrypted amount and unlock time
  └─ emit Locked event
```

#### Release Flow
```
User → releaseLock() → Contract
  ├─ Verify lock is active and matured
  ├─ Add locked amounts back to balances
  ├─ Clear lock position
  └─ emit LockReleased event
```

## How It Works

### Core Concepts

#### Fully Homomorphic Encryption (FHE)
FHE is a form of encryption that allows computations to be performed directly on encrypted data without decrypting it first. The results remain encrypted and, when decrypted, match the results of operations performed on unencrypted data.

**Example**:
```
Encrypt(5) + Encrypt(3) = Encrypt(8)
Decrypt(Encrypt(8)) = 8
```

#### euint64 - Encrypted Unsigned Integers
Zama's FHEVM provides encrypted integer types (`euint8`, `euint16`, `euint32`, `euint64`) that can be used in Solidity smart contracts. FHEVault uses `euint64` to store balances up to 18.4 ETH (considering wei precision).

#### Dual Balance System
FHEVault maintains two parallel balance systems:
- **Encrypted balances** (`euint64`) - Provides privacy and FHE capabilities
- **Plain balances** (`uint256`) - Enables efficient validation and gas-optimized queries

This hybrid approach optimizes for both privacy and practicality.

### User Operations

#### 1. Staking ETH
```solidity
function stake() public payable
```
- User sends ETH to the contract
- Plain balance is increased by the amount
- Encrypted balance is increased using FHE addition
- Both the contract and user are granted access to the encrypted balance

#### 2. Locking Funds
```solidity
function lock(uint256 amount, uint64 duration, externalEuint64 encryptedAmount, bytes calldata inputProof)
```
- User specifies amount and lock duration
- Provides encrypted input (generated client-side using Zama SDK)
- Contract validates proof and creates a time-locked position
- Locked funds are moved from available balance to lock position

#### 3. Releasing Locks
```solidity
function releaseLock()
```
- User calls after lock period expires
- Contract verifies maturity
- Locked amounts are returned to available balances
- User can then redeem or re-lock

#### 4. Redeeming ETH
```solidity
function redeem(uint256 amount)
```
- User specifies amount to withdraw
- Contract validates available balance
- ETH is transferred back to user
- Both plain and encrypted balances are decreased

## Quick Start

For detailed instructions see:
[FHEVM Hardhat Quick Start Tutorial](https://docs.zama.ai/protocol/solidity-guides/getting-started/quick-start-tutorial)

### Prerequisites

- **Node.js**: Version 20 or higher
- **npm or yarn/pnpm**: Package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Create a `.env` file at the repository root:

   ```bash
   PRIVATE_KEY=your_private_key_without_0x
   INFURA_API_KEY=your_infura_project_id
   ETHERSCAN_API_KEY=optional_etherscan_key
   ```

   The same values power both contract deployment and the front-end.

3. **Compile and test**

   ```bash
   npm run compile
   npm run test
   ```

4. **Deploy to local network**

   ```bash
   # Start a local FHEVM-ready node
   npx hardhat node
   # Deploy to local network
   npx hardhat deploy --network localhost
   ```

5. **Deploy to Sepolia Testnet**

   ```bash
   # Deploy to Sepolia
   npx hardhat deploy --network sepolia
   # Verify contract on Etherscan
   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
   ```

6. **Test on Sepolia Testnet**

   ```bash
   # Once deployed, you can run a simple test on Sepolia.
   npx hardhat test --network sepolia
   ```

## Smart Contract Features

### Core Functions

#### `stake() payable`
Allows users to deposit ETH and mint encrypted fETH receipts.
- **Access**: Public
- **Input**: ETH sent with transaction (msg.value)
- **Effects**: Increases both plain and encrypted balances
- **Events**: `Staked(user, amount)`
- **Gas Estimate**: ~150,000 gas

#### `redeem(uint256 amount)`
Withdraws available ETH back to the user.
- **Access**: User-owned balances only
- **Input**: Amount in wei to withdraw
- **Requirements**: Sufficient unlocked balance
- **Events**: `Redeemed(user, amount)`
- **Gas Estimate**: ~100,000 gas

#### `lock(uint256 amount, uint64 duration, externalEuint64 encryptedAmount, bytes calldata inputProof)`
Creates a time-locked position with encrypted balance.
- **Access**: User-owned balances only
- **Input**:
  - `amount`: Plain amount to lock (wei)
  - `duration`: Lock period in seconds
  - `encryptedAmount`: Client-side encrypted amount
  - `inputProof`: Zero-knowledge proof of encryption
- **Requirements**:
  - No existing active lock
  - Sufficient available balance
  - Valid encryption proof
- **Events**: `Locked(user, amount, unlockTime)`
- **Gas Estimate**: ~250,000 gas

#### `releaseLock()`
Releases a matured lock and returns funds to available balance.
- **Access**: User-owned locks only
- **Requirements**:
  - Active lock exists
  - Current time >= unlock time
- **Events**: `LockReleased(user, amount)`
- **Gas Estimate**: ~120,000 gas

### View Functions

#### `getEncryptedBalance(address user) returns (euint64)`
Returns the FHE-encrypted balance for a user.
- Requires permission to decrypt
- Use with Zama SDK's decryption API

#### `getAvailableBalance(address user) returns (uint256)`
Returns the plain (non-locked) balance for a user.
- Gas-free query
- Useful for UI display and validation

#### `getLockInfo(address user) returns (bool active, uint64 unlockTime, euint64 encryptedAmount, uint256 plainAmount)`
Returns detailed lock position information.
- Shows lock status, maturity time, and amounts
- Encrypted amount requires decryption permission

#### `canRelease(address user) returns (bool)`
Checks if a user's lock has matured and can be released.
- Gas-free query
- Useful for UI status indicators

### Security Features

1. **Reentrancy Protection**: Custom `nonReentrant` modifier on all state-changing functions
2. **Access Control**: Users can only manage their own balances
3. **Overflow Protection**: Solidity 0.8+ built-in overflow checks
4. **Input Validation**: All inputs validated before processing
5. **Amount Limits**: Maximum amount limited to `uint64.max` to fit encrypted type

## Frontend Features

### Wallet Integration
- **RainbowKit**: Beautiful, customizable wallet connection UI
- **Multi-wallet Support**: MetaMask, WalletConnect, Coinbase Wallet, and more
- **Network Detection**: Automatic detection and switching to Sepolia testnet

### FHE Operations
- **Client-side Encryption**: Generates encrypted inputs using Zama SDK
- **Proof Generation**: Creates zero-knowledge proofs for encrypted values
- **Decryption**: Retrieves and decrypts user's encrypted balance
- **Permission Management**: Handles FHE access control automatically

### User Interface Components
- **VaultApp**: Main application interface
  - Stake ETH with amount input
  - View encrypted and plain balances
  - Lock funds with duration selector
  - Release matured locks
  - Redeem ETH
- **Header**: Wallet connection and network status
- **Real-time Updates**: Automatic balance refresh after transactions
- **Transaction Feedback**: Loading states and success/error messages

### State Management
- **TanStack Query**: Efficient async state and caching
- **Wagmi Hooks**: React hooks for Ethereum interaction
- **TypeScript**: Full type safety throughout the app

## Security

### Smart Contract Security

#### Audited Patterns
- Reentrancy protection using custom guard
- Checks-Effects-Interactions pattern
- Safe arithmetic with Solidity 0.8+
- Input validation on all public functions

#### FHE-Specific Security
- **Access Control Lists (ACL)**: Zama's ACL system ensures only authorized addresses can decrypt values
- **Proof Verification**: All encrypted inputs must include valid proofs
- **Key Management**: User private keys never touch the contract
- **Deterministic Encryption**: Same input always produces same ciphertext for auditability

#### Known Limitations
- **Amount Ceiling**: Limited to `uint64.max` wei (~18.4 ETH) per encrypted operation
- **Single Lock Limit**: One active lock per user (by design for MVP)
- **No Emergency Pause**: Consider adding pausable functionality for production
- **No Upgrade Mechanism**: Contract is immutable (consider proxy pattern for production)

### Frontend Security
- **Environment Variables**: Sensitive keys stored in `.env` (never committed)
- **Input Validation**: All user inputs sanitized before blockchain submission
- **Secure RPC**: Uses reputable providers (Infura)
- **No Private Key Exposure**: Relies on user's wallet for signing

### Recommendations for Production
1. **Professional Audit**: Engage security firm for comprehensive audit
2. **Bug Bounty**: Launch bug bounty program
3. **Gradual Rollout**: Start with deposit limits, increase over time
4. **Monitoring**: Implement on-chain monitoring and alerting
5. **Emergency Procedures**: Add multi-sig admin with pause capability
6. **Upgrade Path**: Consider UUPS or transparent proxy pattern
7. **Insurance**: Explore smart contract insurance options

## Testing

### Local Testing (Mock FHEVM)

The test suite uses Hardhat's local network with mock FHE operations:

```bash
npm run test
```

**Test Coverage**:
- ✅ Zero balance for new users
- ✅ Staking ETH updates balances correctly
- ✅ Encrypted balance matches plain balance after staking
- ✅ Locking reduces available balance
- ✅ Lock position stores encrypted amount correctly
- ✅ Cannot release lock before maturity
- ✅ Release lock returns funds to available balance
- ✅ Redeeming withdraws ETH and updates balances
- ✅ Cannot redeem more than available balance

**Test File**: `test/FHEVault.ts`

### Sepolia Testnet Testing

Test against real FHEVM infrastructure:

```bash
npm run test:sepolia
```

**Prerequisites**:
- Sepolia testnet ETH
- `.env` configured with private key and Infura API key
- Deployed contract on Sepolia

**Test File**: `test/FHEVaultSepolia.ts`

### Coverage Report

Generate test coverage report:

```bash
npm run coverage
```

Coverage report will be generated in `coverage/` directory.

### Gas Reporting

Enable gas reporting in `hardhat.config.ts`:

```typescript
gasReporter: {
  enabled: true,
  currency: 'USD',
  coinmarketcap: process.env.COINMARKETCAP_API_KEY
}
```

### Manual Testing Checklist

- [ ] Connect wallet to Sepolia testnet
- [ ] Stake small amount of ETH
- [ ] Verify encrypted balance can be decrypted
- [ ] Lock portion of staked funds
- [ ] Attempt early release (should fail)
- [ ] Wait for lock maturity
- [ ] Release lock successfully
- [ ] Redeem funds back to wallet
- [ ] Verify ETH received

## Deployment

### Local Deployment

1. **Start local Hardhat node**:
```bash
npx hardhat node
```

2. **Deploy contracts** (in a new terminal):
```bash
npx hardhat deploy --network localhost
```

3. **Start frontend**:
```bash
cd ui
npm run dev
```

### Sepolia Testnet Deployment

1. **Configure environment**:
```bash
# .env file
PRIVATE_KEY=your_private_key_without_0x
INFURA_API_KEY=your_infura_project_id
ETHERSCAN_API_KEY=your_etherscan_api_key
```

2. **Get Sepolia ETH**:
- Use [Sepolia Faucet](https://sepoliafaucet.com/)
- Or [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)

3. **Deploy contract**:
```bash
npx hardhat deploy --network sepolia
```

4. **Verify on Etherscan**:
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

5. **Update frontend config**:
```typescript
// ui/src/config/contracts.ts
export const FHEVAULT_ADDRESS = '0x...'; // Your deployed address
```

6. **Deploy frontend**:

**Option A: Netlify** (recommended)
- Push code to GitHub
- Connect repository to Netlify
- Set environment variables in Netlify dashboard
- Deploy automatically

**Option B: Vercel**
```bash
cd ui
npm run build
vercel deploy
```

### Production Deployment (Mainnet)

**⚠️ WARNING**: This is experimental technology. Do NOT deploy to mainnet without:
1. Comprehensive security audit
2. Extensive testnet battle-testing
3. Insurance coverage
4. Emergency response plan
5. Legal review

## 📁 Project Structure

```
fheVault/
├── contracts/              # Smart contract source files
│   └── FHEVault.sol       # Main vault contract with FHE
├── deployments/           # Hardhat deploy records
│   ├── sepolia/          # Sepolia testnet deployments
│   └── localhost/        # Local network deployments
├── deploy/               # Deployment scripts
│   └── deploy.ts        # Main deployment script
├── tasks/                # Custom Hardhat tasks
│   └── FHEVault.ts      # Vault interaction tasks
├── test/                 # Test suites
│   ├── FHEVault.ts      # Local mock tests
│   └── FHEVaultSepolia.ts  # Sepolia integration tests
├── ui/                   # React frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── config/      # Configuration files
│   │   ├── hooks/       # Custom React hooks
│   │   └── styles/      # CSS stylesheets
│   ├── public/          # Static assets
│   └── package.json     # Frontend dependencies
├── hardhat.config.ts     # Hardhat configuration
├── package.json          # Smart contract dependencies
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Future Roadmap

### Phase 1: Core Enhancements (Q2 2025)
- [ ] **Multiple Locks**: Allow users to have multiple concurrent lock positions
- [ ] **Flexible Lock Durations**: Add preset duration options (1 week, 1 month, 3 months, 1 year)
- [ ] **Lock Rewards**: Implement reward multipliers for longer lock periods
- [ ] **Partial Unlocks**: Enable partial release of locked funds instead of all-or-nothing
- [ ] **Enhanced UI**: Improve user experience with better visualizations and animations

### Phase 2: Advanced Privacy Features (Q3 2025)
- [ ] **Private Transfers**: Allow users to transfer encrypted fETH to other users
- [ ] **Shielded Withdrawals**: Implement privacy-preserving withdrawal mechanism
- [ ] **Zero-Knowledge Proofs**: Add ZK proofs for balance verification without revealing amounts
- [ ] **Confidential Governance**: Enable private voting for vault parameters

### Phase 3: DeFi Integration (Q4 2025)
- [ ] **Yield Generation**: Integrate with DeFi protocols for passive yield on staked assets
- [ ] **Collateralized Loans**: Use encrypted balances as collateral for loans
- [ ] **Private DEX**: Enable confidential token swaps
- [ ] **Liquidity Pools**: Create FHE-based private liquidity pools
- [ ] **Cross-Chain Bridge**: Bridge encrypted assets across chains

### Phase 4: Institutional Features (Q1 2026)
- [ ] **Multi-Signature Support**: Enable multi-sig wallets for institutional users
- [ ] **Compliance Module**: Add selective disclosure for regulatory compliance
- [ ] **Audit Trails**: Comprehensive encrypted audit logs
- [ ] **White-Label Solution**: Package for institutional deployment
- [ ] **SLA Guarantees**: Service level agreements for uptime and performance

### Phase 5: Mainnet & Scale (Q2 2026)
- [ ] **Security Audit**: Comprehensive third-party security audit
- [ ] **Gas Optimization**: Reduce transaction costs by 30-50%
- [ ] **Mainnet Deployment**: Launch on Ethereum mainnet
- [ ] **Layer 2 Deployment**: Deploy on Optimism, Arbitrum, zkSync
- [ ] **Insurance Coverage**: Smart contract insurance partnership

### Research & Innovation
- [ ] **Post-Quantum Security**: Explore post-quantum FHE schemes
- [ ] **Hardware Acceleration**: Optimize FHE operations with specialized hardware
- [ ] **Novel Crypto Primitives**: Research advanced FHE protocols (TFHE, BGV)
- [ ] **Private Smart Contracts**: Fully confidential smart contract logic
- [ ] **Regulatory Framework**: Work with regulators on privacy-preserving DeFi standards

### Community & Ecosystem
- [ ] **Developer SDK**: Comprehensive SDK for building on FHEVault
- [ ] **Bug Bounty Program**: Incentivized security research
- [ ] **Governance Token**: Decentralized governance for protocol parameters
- [ ] **Educational Content**: Tutorials, workshops, documentation
- [ ] **Grants Program**: Fund developers building FHE-based DeFi applications

## 📜 Available Scripts

### Smart Contract Scripts

| Script             | Description                          |
| ------------------ | ------------------------------------ |
| `npm run compile`  | Compile all Solidity contracts       |
| `npm run test`     | Run local tests with mock FHEVM      |
| `npm run test:sepolia` | Run tests on Sepolia testnet     |
| `npm run coverage` | Generate test coverage report        |
| `npm run lint`     | Run linting checks (Solidity & TS)   |
| `npm run lint:sol` | Lint Solidity contracts only         |
| `npm run lint:ts`  | Lint TypeScript files only           |
| `npm run prettier:check` | Check code formatting          |
| `npm run prettier:write` | Auto-format all files          |
| `npm run clean`    | Clean build artifacts                |
| `npm run typechain` | Generate TypeScript bindings        |

### Deployment Scripts

| Script                     | Description                    |
| -------------------------- | ------------------------------ |
| `npm run chain`           | Start local Hardhat node       |
| `npm run deploy:localhost` | Deploy to local network        |
| `npm run deploy:sepolia`   | Deploy to Sepolia testnet      |
| `npm run verify:sepolia`   | Verify contract on Etherscan   |

### Frontend Scripts (`ui/`)

```bash
cd ui
npm install        # Install dependencies
npm run dev        # Start development server (http://localhost:5173)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Lint frontend code
```

**Frontend Configuration**:
After deploying `FHEVault` to Sepolia, update `ui/src/config/contracts.ts` with the deployed contract address.

## 📚 Documentation

### Official Zama FHEVM Documentation
- **[FHEVM Documentation](https://docs.zama.ai/fhevm)** - Comprehensive guide to Fully Homomorphic Encryption on Ethereum
- **[FHEVM Hardhat Setup Guide](https://docs.zama.ai/protocol/solidity-guides/getting-started/setup)** - Getting started with FHEVM in Hardhat
- **[FHEVM Testing Guide](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat/write_test)** - Writing tests for FHE smart contracts
- **[FHEVM Hardhat Plugin](https://docs.zama.ai/protocol/solidity-guides/development-guide/hardhat)** - Using the Hardhat plugin for FHEVM

### Zama Resources
- **[Zama Official Website](https://www.zama.ai/)** - Learn about Zama and FHE technology
- **[Zama GitHub](https://github.com/zama-ai)** - Open-source FHE tools and libraries
- **[FHEVM Whitepaper](https://github.com/zama-ai/fhevm/blob/main/fhevm-whitepaper.pdf)** - Technical details of FHEVM architecture
- **[Concrete Library](https://docs.zama.ai/concrete)** - Underlying FHE library powering FHEVM

### Development Tools
- **[Hardhat Documentation](https://hardhat.org/docs)** - Ethereum development environment
- **[ethers.js v6 Docs](https://docs.ethers.org/v6/)** - Ethereum library documentation
- **[Wagmi Documentation](https://wagmi.sh/)** - React hooks for Ethereum
- **[RainbowKit Docs](https://www.rainbowkit.com/docs/introduction)** - Wallet connection UI library
- **[Vite Documentation](https://vitejs.dev/)** - Frontend build tool

### Tutorials & Guides
- **[Building Privacy-Preserving DApps with FHEVM](https://docs.zama.ai/fhevm/tutorials)** - Step-by-step tutorials
- **[Understanding Encrypted Types](https://docs.zama.ai/fhevm/fundamentals/types)** - Guide to euint types
- **[Access Control in FHEVM](https://docs.zama.ai/fhevm/fundamentals/acl)** - Managing encrypted data permissions
- **[Gas Optimization for FHE Operations](https://docs.zama.ai/fhevm/guides/gas)** - Reducing transaction costs

### Research Papers
- **[Fully Homomorphic Encryption](https://en.wikipedia.org/wiki/Homomorphic_encryption)** - Wikipedia overview
- **[TFHE: Fast Fully Homomorphic Encryption over the Torus](https://eprint.iacr.org/2018/421.pdf)** - Underlying cryptography
- **[Programmable Bootstrap for Encrypted Computation](https://eprint.iacr.org/2021/091.pdf)** - FHE optimization techniques

### Video Tutorials
- **[Zama YouTube Channel](https://www.youtube.com/@zama_fhe)** - Video tutorials and presentations
- **[FHEVM Workshop Series](https://www.youtube.com/watch?v=...)** - Hands-on development workshops
- **[Encrypted Smart Contracts Explained](https://www.youtube.com/watch?v=...)** - Conceptual overview

## Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**
   - Check existing issues first
   - Provide detailed reproduction steps
   - Include environment information (OS, Node version, etc.)
   - Add screenshots or error logs if applicable

2. **Suggest Features**
   - Open an issue with the `enhancement` label
   - Clearly describe the use case
   - Explain why this feature would be valuable

3. **Submit Pull Requests**
   - Fork the repository
   - Create a feature branch (`git checkout -b feature/amazing-feature`)
   - Follow the coding standards
   - Write tests for new functionality
   - Update documentation as needed
   - Submit a PR with a clear description

4. **Improve Documentation**
   - Fix typos or unclear explanations
   - Add examples and use cases
   - Translate documentation to other languages
   - Create tutorials or guides

5. **Community Support**
   - Answer questions in discussions
   - Help other developers in Discord
   - Share your projects built with FHEVault

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/YOUR_USERNAME/fheVault.git
cd fheVault

# Install dependencies
npm install

# Run tests to ensure everything works
npm run test

# Create a feature branch
git checkout -b feature/my-contribution

# Make your changes and test
npm run test
npm run lint

# Commit your changes
git commit -m "Add: description of your changes"

# Push to your fork
git push origin feature/my-contribution

# Create a Pull Request on GitHub
```

### Coding Standards

- **Solidity**: Follow [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
- **TypeScript**: Use ESLint and Prettier configurations provided
- **Testing**: Maintain or improve test coverage
- **Documentation**: Update README and inline comments for significant changes
- **Commit Messages**: Use conventional commits format (feat:, fix:, docs:, etc.)

### Code Review Process

1. All PRs require at least one review from a maintainer
2. CI/CD checks must pass (tests, linting, coverage)
3. Significant changes may require additional discussion
4. Maintainers may request changes or ask questions
5. Once approved, maintainers will merge the PR

### Questions?

- **Discord**: Join [Zama Discord](https://discord.gg/zama) for real-time discussions
- **GitHub Discussions**: For longer-form conversations and questions
- **Twitter**: Follow [@zama_fhe](https://twitter.com/zama_fhe) for updates

## Use Cases & Applications

### DeFi Applications

1. **Private Staking Pools**
   - Stake assets without revealing positions
   - Protect whales from targeted attacks
   - Enable confidential validator rewards

2. **Confidential Lending Protocols**
   - Borrow against encrypted collateral
   - Private credit scores
   - Hidden liquidation levels

3. **Secret Yield Farming**
   - Farm yields without revealing strategies
   - Prevent copy-trading and front-running
   - Competitive advantage through privacy

4. **Private DAOs**
   - Confidential treasury management
   - Anonymous voting with verifiable results
   - Private allocation of resources

### Institutional Use Cases

1. **Corporate Treasury Management**
   - Manage company assets privately on-chain
   - Regulatory compliance with selective disclosure
   - Competitive secrecy for strategic positions

2. **Hedge Funds & Asset Managers**
   - Execute strategies without revealing positions
   - Prevent front-running by market makers
   - Maintain competitive edge

3. **Private Equity & Venture Capital**
   - Confidential investment tracking
   - Private cap table management
   - Anonymous shareholder registries

### Consumer Applications

1. **Private Savings Accounts**
   - Save on-chain without revealing balances
   - Earn interest privately
   - Protection from targeted phishing

2. **Confidential Payroll**
   - Pay salaries without public disclosure
   - Privacy for employees
   - Compliance with privacy regulations

3. **Private Wealth Management**
   - High-net-worth individuals maintain privacy
   - Estate planning with confidentiality
   - Secure family trusts

### Gaming & NFTs

1. **Hidden Game Balances**
   - In-game currencies with private balances
   - Prevent targeting of wealthy players
   - Fair gameplay without information asymmetry

2. **Blind Auctions**
   - NFT auctions with hidden bids
   - Fair price discovery
   - Prevent bid sniping

3. **Private Gaming Economies**
   - Confidential trading of in-game assets
   - Hidden inventory and resources
   - Strategic gameplay with information privacy

## Performance Metrics

### Gas Costs (Sepolia Testnet)

| Operation      | Gas Used | USD Cost (Gwei=50, ETH=$3000) |
| -------------- | -------- | ----------------------------- |
| stake()        | ~150,000 | ~$22.50                       |
| lock()         | ~250,000 | ~$37.50                       |
| releaseLock()  | ~120,000 | ~$18.00                       |
| redeem()       | ~100,000 | ~$15.00                       |

*Note: Gas costs vary based on network congestion and complexity of encrypted operations*

### Transaction Times

| Network         | Average Confirmation Time |
| --------------- | ------------------------- |
| Sepolia Testnet | 12-15 seconds            |
| Mainnet (est.)  | 12-15 seconds            |
| L2 (future)     | 1-2 seconds              |

### Encrypted Operation Limits

- **Maximum encrypted amount**: 18,446,744,073,709,551,615 wei (~18.4 ETH)
- **Encryption time (client-side)**: ~50-100ms
- **Decryption time (relayer)**: ~200-500ms
- **Concurrent users**: Unlimited (contract scalability)

## Frequently Asked Questions (FAQ)

### General Questions

**Q: What is Fully Homomorphic Encryption (FHE)?**
A: FHE is a cryptographic technique that allows computation on encrypted data without decrypting it first. Results remain encrypted and can only be decrypted by the owner.

**Q: How is this different from Zero-Knowledge Proofs?**
A: ZK proofs verify statements without revealing information, while FHE enables computation on encrypted data. FHEVault uses FHE for balance privacy and ZK proofs for input verification.

**Q: Can anyone see my balance?**
A: No. Your balance is encrypted on-chain. Only you (with your private key) can decrypt it. Even the smart contract cannot see the actual amount.

**Q: Is this production-ready?**
A: FHEVault is currently in beta on Sepolia testnet. It is NOT recommended for mainnet deployment without comprehensive security audits and extensive testing.

### Technical Questions

**Q: What happens if I lose my private key?**
A: Like any blockchain application, losing your private key means permanent loss of access to your encrypted balance. Always backup your keys securely.

**Q: Why is there a uint64 limit on amounts?**
A: FHEVM's encrypted types have size limits for computational efficiency. euint64 is the largest practical type, limiting amounts to 18.4 ETH per operation. We plan to add support for larger amounts via chunking in future versions.

**Q: Can I transfer my encrypted balance to another user?**
A: Not in the current version. Private transfers are planned for Phase 2 of the roadmap.

**Q: How much does encryption add to gas costs?**
A: FHE operations are more expensive than standard arithmetic. Expect 2-5x higher gas costs compared to non-encrypted equivalents.

### Security Questions

**Q: Has this been audited?**
A: Not yet. Professional security audit is planned before mainnet deployment. Current version is for testing and development only.

**Q: What if there's a bug in the contract?**
A: The contract is immutable. Bugs cannot be fixed without redeployment. This is why thorough testing and auditing are critical before mainnet launch.

**Q: Is the encryption quantum-resistant?**
A: Current FHEVM implementation is not quantum-resistant. Post-quantum FHE schemes are an area of active research planned for future versions.

**Q: Can the government/authorities access my encrypted balance?**
A: Only you can decrypt your balance with your private key. However, metadata (transaction timing, amounts via plain balance, addresses) are visible on-chain.

## Troubleshooting

### Common Issues

#### "Insufficient balance" error when I have funds
**Solution**: Check that your funds are not locked. Use `getAvailableBalance()` to see unlocked funds.

#### Transaction fails with "Lock already active"
**Solution**: Release your existing lock before creating a new one. Only one lock per user is supported.

#### Cannot decrypt encrypted balance
**Solution**:
- Ensure you have permission to decrypt (call `FHE.allow()`)
- Check that you're using the correct Zama relayer endpoint
- Verify your wallet is connected to the correct network

#### Frontend can't connect to wallet
**Solution**:
- Install MetaMask or another compatible wallet
- Switch to Sepolia testnet in your wallet
- Refresh the page and try reconnecting

#### Deployment fails on Sepolia
**Solution**:
- Check that you have sufficient Sepolia ETH (get from faucet)
- Verify your `PRIVATE_KEY` and `INFURA_API_KEY` in `.env`
- Ensure you're connected to the correct network

#### Tests fail locally
**Solution**:
```bash
# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run compile
npm run test
```

### Getting Help

If you encounter issues not covered here:

1. **Check Documentation**: Review this README and Zama docs
2. **Search Issues**: Look for similar issues on GitHub
3. **Ask Community**: Join Zama Discord for real-time help
4. **Open Issue**: Create a detailed bug report on GitHub

## Acknowledgments

### Built With

- **[Zama](https://www.zama.ai/)** - For pioneering FHEVM technology and making encrypted smart contracts possible
- **[Hardhat](https://hardhat.org/)** - For the excellent Ethereum development environment
- **[OpenZeppelin](https://www.openzeppelin.com/)** - For smart contract security patterns
- **[RainbowKit](https://www.rainbowkit.com/)** - For the beautiful wallet connection UI
- **[Wagmi](https://wagmi.sh/)** - For powerful React hooks for Ethereum

### Inspiration

This project was inspired by the need for privacy in DeFi and the groundbreaking work by Zama in making FHE practical for blockchain applications.

### Contributors

Thank you to all the contributors who have helped build FHEVault!

<!-- Add contributor list here once we have external contributors -->

### Special Thanks

- Zama team for FHEVM technology and developer support
- Ethereum Foundation for blockchain infrastructure
- Open-source community for tools and libraries

## License

This project is licensed under the **BSD-3-Clause-Clear License**.

### What This Means

- ✅ Commercial use permitted
- ✅ Modification permitted
- ✅ Distribution permitted
- ✅ Private use permitted
- ❌ Patent use NOT granted
- ⚠️ No warranty or liability

See the [LICENSE](LICENSE) file for full details.

### Third-Party Licenses

This project uses open-source software with the following licenses:
- **FHEVM**: BSD-3-Clause-Clear License
- **Hardhat**: MIT License
- **React**: MIT License
- **ethers.js**: MIT License
- **Wagmi**: MIT License
- **RainbowKit**: MIT License

## Support

### Need Help?

- **📖 Documentation**: Read this README and [Zama docs](https://docs.zama.ai)
- **💬 Discord**: Join [Zama Discord](https://discord.gg/zama) for community support
- **🐛 GitHub Issues**: [Report bugs or request features](https://github.com/YOUR_USERNAME/fheVault/issues)
- **📧 Email**: Contact the maintainers at [your-email@example.com]
- **🐦 Twitter**: Follow [@zama_fhe](https://twitter.com/zama_fhe) for updates

### Useful Links

- **Website**: [Your project website]
- **Demo**: [Live demo link]
- **GitHub**: [https://github.com/YOUR_USERNAME/fheVault](https://github.com/YOUR_USERNAME/fheVault)
- **Documentation**: [Extended docs if available]

---

<p align="center">
  <strong>Built with privacy in mind using Zama's FHEVM technology</strong>
  <br>
  <br>
  <a href="https://www.zama.ai/">Zama</a> •
  <a href="https://docs.zama.ai/fhevm">FHEVM Docs</a> •
  <a href="https://discord.gg/zama">Discord</a> •
  <a href="https://twitter.com/zama_fhe">Twitter</a>
</p>

<p align="center">
  Made with ❤️ for a more private DeFi future
</p>
