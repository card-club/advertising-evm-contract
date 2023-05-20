import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-foundry";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-gas-reporter";
import "hardhat-contract-sizer";
import * as envEnc from "@chainlink/env-enc";
envEnc.config();

const DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS = 2;
const SHARED_DON_PUBLIC_KEY =
  "a30264e813edc9927f73e036b7885ee25445b836979cb00ef112bc644bd16de2db866fa74648438b34f52bb196ffa386992e94e0a3dc6913cee52e2e98f1619c";

const isTestEnvironment = process.env.npm_lifecycle_event == "test";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!isTestEnvironment && !PRIVATE_KEY) {
  throw Error(
    "Set the PRIVATE_KEY environment variable with your EVM wallet private key"
  );
}

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.18",
    settings: {
      optimizer: {
        enabled: true,
        // Need to figure out what the right runs value is, contract size (more runs, bigger contract payload) vs code achieve maximum efficiency.
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      accounts: process.env.PRIVATE_KEY
        ? [
            {
              privateKey: process.env.PRIVATE_KEY,
              balance: "10000000000000000000000",
            },
          ]
        : [],
    },
    avalancheFuji: {
      url: "https://api.avax-test.network/ext/bc/C/rpc",
      gasPrice: undefined,
      accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
      chainId: 43113,
      // linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
      // linkPriceFeed: "0x79c91fd4F8b3DaBEe17d286EB11cEE4D83521775", // LINK/AVAX
      // functionsOracleProxy: "0xE569061eD8244643169e81293b0aA0d3335fD563",
      // functionsBillingRegistryProxy: "0x452C33Cef9Bc773267Ac5F8D85c1Aca2bA4bcf0C",
      // functionsPublicKey: SHARED_DON_PUBLIC_KEY,
    },
    // Chainlink has no Avalanche mainnet support of Chainlink functions yet, but good to have this here for the future
    mainnet: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      gasPrice: 225000000000,
      chainId: 43114,
      accounts: [],
    },
  },
  etherscan: {
    apiKey: {
      avalancheFujiTestnet: process.env.SNOWTRACE_API_KEY || "",
    },
  },
  gasReporter: {
    enabled: true,
    currency: "EUR",
    noColors: false,
    coinmarketcap: process.env.COIN_MARKETCAP_API_KEY || "",
    token: "AVAX"
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: ['Lock'],
  }
};

export default config;
