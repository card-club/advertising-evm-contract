require("@nomicfoundation/hardhat-toolbox")
require("hardhat-contract-sizer")
require("@openzeppelin/hardhat-upgrades")
require("./tasks")
require("@chainlink/env-enc").config()

const isTestEnvironment = process.env.npm_lifecycle_event == "test";

const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!isTestEnvironment && !PRIVATE_KEY) {
  throw Error(
    "Set the PRIVATE_KEY environment variable with your EVM wallet private key"
  );
}

const SOLC_SETTINGS = {
  optimizer: {
    enabled: true,
    runs: 1_000,
  },
}

module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.7",
        settings: SOLC_SETTINGS,
      },
      {
        version: "0.7.0",
        settings: SOLC_SETTINGS,
      },
      {
        version: "0.6.6",
        settings: SOLC_SETTINGS,
      },
      {
        version: "0.4.24",
        settings: SOLC_SETTINGS,
      },
    ],
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
    token: "AVAX",
  },
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [],
  },
};
