# Card.Club Advertising Chainlink Functions - SpaceAndTime - EVM smart contract

Basically this smart contract will be used to create:

- create an ad request with fair pricing (limited by historic card.club game/story statistics, doesn't make sense to buy more advertising than is possible to deliver) (chainlink function/solidity)
  - Do one query to count views and substract current advertising scheduled views
- approving ad request (so we can prevent malicious ads and we can see who approved the ad, but also reward them for the approving work) (pure solidity)
- approved ads get queried by spaceandtime and will be used in card.club games/stories

This project will only use Hardhat (because of the Chainlink functions integration) development flow.

https://hardhat.org/hardhat-runner/docs/getting-started#overview

1. Extract all the necessary code from the https://github.com/smartcontractkit/functions-hardhat-starter-kit for running Chainlink functions and really understand the whole flow
2. Create ad request function
3. Create approving ad request function
4. Testing:
   1. Good testing suite (including Stateless and Stateful Fuzz Tests and integration tests)
   2. Static analysis tooling passing
   3. Invariants formalized
   4. Good documentation
   5. Release, Maintenance and Recovery plans in place

## Avalanche Fuji faucet and snowtrace

https://faucet.avax.network/
https://testnet.snowtrace.io/

## Deploy and verify

Deploy cardclub.sol
```
npx hardhat functions-deploy-client --network avalancheFuji --verify true
```

Approve link 

https://testnet.snowtrace.io/token/0x0b9d5d9136855f6fec3c0993fee6e9ce8a297846?a=0xf4e20531cd11fb8b70896aa9710fedbeb9be87c3#writeContract

Fund Functions billing subscription
```
npx hardhat functions-sub-create --network avalancheFuji --amount 0.3 --contract 0xCAd3956Bde4cd281c3E8393cA7f4bc38c5879176
```

Do request for ad purchase
```
npx hardhat functions-request --network avalancheFuji --contract 0xCAd3956Bde4cd281c3E8393cA7f4bc38c5879176 --subid 19 --gaslimit 250000
```