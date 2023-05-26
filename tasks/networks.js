// All supported networks and related contract addresses are defined here.
//
// LINK token addresses: https://docs.chain.link/resources/link-token-contracts/
// Price feeds addresses: https://docs.chain.link/data-feeds/price-feeds/addresses
// Chain IDs: https://chainlist.org/?testnets=true

require("@chainlink/env-enc").config();

const DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS = 2;
const SHARED_DON_PUBLIC_KEY =
  "a30264e813edc9927f73e036b7885ee25445b836979cb00ef112bc644bd16de2db866fa74648438b34f52bb196ffa386992e94e0a3dc6913cee52e2e98f1619c";

const npmCommand = process.env.npm_lifecycle_event;
const isTestEnvironment = npmCommand == "test" || npmCommand == "test:unit";

// Set EVM private key (required)
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!isTestEnvironment && !PRIVATE_KEY) {
  throw Error(
    "Set the PRIVATE_KEY environment variable with your EVM wallet private key"
  );
}

const networks = {
  avalancheFuji: {
    url: process.env.AVALANCHE_FUJI_RPC_URL || "UNSET",
    gasPrice: undefined,
    accounts: PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
    verifyApiKey: process.env.SNOWTRACE_API_KEY || "UNSET",
    chainId: 43113,
    confirmations: 2 * DEFAULT_VERIFICATION_BLOCK_CONFIRMATIONS,
    nativeCurrencySymbol: "AVAX",
    linkToken: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846",
    linkPriceFeed: "0x79c91fd4F8b3DaBEe17d286EB11cEE4D83521775", // LINK/AVAX
    functionsOracleProxy: "0xE569061eD8244643169e81293b0aA0d3335fD563",
    functionsBillingRegistryProxy: "0x452C33Cef9Bc773267Ac5F8D85c1Aca2bA4bcf0C",
    functionsPublicKey: SHARED_DON_PUBLIC_KEY,
  },
};

module.exports = {
  networks,
  SHARED_DON_PUBLIC_KEY,
};
