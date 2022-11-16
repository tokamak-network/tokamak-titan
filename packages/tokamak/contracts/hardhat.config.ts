import { HardhatUserConfig } from 'hardhat/types'
import 'solidity-coverage'
import * as dotenv from 'dotenv'

// Hardhat plugins
import 'hardhat-deploy'
import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-waffle'
import '@nomiclabs/hardhat-etherscan'

// Hardhat tasks
import './tasks/deploy'

// Load environment variables from .env
dotenv.config()

// Fix lint
if (!process.env.L1_NODE_WEB3_URL) {
  process.env.L1_NODE_WEB3_URL = 'http://localhost:9545'
}

const privateKey = process.env.PRIVATE_KEY || '0x' + '11'.repeat(32)
// this is to avoid hardhat error
const deploy = process.env.DEPLOY_DIRECTORY || 'deploy'

const config: HardhatUserConfig = {
  mocha: {
    timeout: 300000,
  },
  networks: {
    hardhat: {
      live: false,
      saveDeployments: false,
      tags: ['local'],
    },
    optimism: {
      url: 'http://localhost:8545',
      saveDeployments: false,
    },
    'hardhat-remote': {
      chainId: 31337,
      url: process.env.CONTRACTS_RPC_URL || '',
      deploy,
      accounts: [privateKey],
    },
    mainnet: {
      chainId: 1,
      url: process.env.CONTRACTS_RPC_URL || '',
      deploy,
      accounts: [privateKey],
    },
  },
  solidity: {
    compilers: [
      {
        version: '0.8.9',
        settings: {
          optimizer: { enabled: true, runs: 10_000 },
          metadata: {
            bytecodeHash: 'none',
          },
          outputSelection: {
            '*': {
              '*': ['storageLayout'],
            },
          },
        },
      },
      {
        version: '0.5.17', // Required for WETH9
        settings: {
          optimizer: { enabled: true, runs: 10_000 },
          outputSelection: {
            '*': {
              '*': ['storageLayout'],
            },
          },
        },
      },
    ],
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
    },
  },
}

export default config
