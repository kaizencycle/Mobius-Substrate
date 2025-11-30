import { HardhatUserConfig } from 'hardhat/config';

// Note: @nomicfoundation/hardhat-toolbox requires many peer dependencies
// For basic compilation, we don't need it

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    sepolia: {
      url: process.env.RPC_URL || '',
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};

export default config;
