# Card.Club - Advertising Proof of concept

## Chainlink Functions - EVM smart contract - SpaceAndTime

Card.Club allows any user to create an ad request with fair pricing based on historic verifiable immutable analytics data and they can verify in the future that they received the views.

## Design decisions Smart Contract/Chainlink function

Show image of the presentation pipeline (from client to ad buyer)

Making a Chainlink function public callable introduces the following challenges:

1. How to prevent people calling your contract to drain the subscription of Link
2. Prevent that they can execute different scripts, like sending potential secrets to an endpoint of theirs
3. Refund them when the API call failed
4. Understanding the limits/timeouts of the Chainlink Functions and implementing the best chance of a succesfull call

#### Prevent draining the subscription of Link

There are a couple of approaches, like allow listing users you 'trust', but the the only way to make it publicly callable without headaches is to let the users pay it themselves. You will get an externally undrainable subscription if you charge enough and the surplus (this happens because you want to deal with potentially high gas costs) can always be withdrawn by the owner of the subscription.

#### Prevent executing different script

You can sacrifise flexibility and set the script source you want to execute in the constructor or even hardcode it, but the more elegant solution I think would be to check the hash of the script source and make the hash configurable by the owner. Advantage is that you can change the script source without redeploying the contract or pay more gas fees.

#### When API call keeps failing

You should never let an user pay for something they didn't receive. It's not a lottery when they interact with your smart contract and it is using an API that fails (which could be not your fault). The solution is quite simple, if the chainlink function gives back an error, we refund the Link they sent.

#### Improving the Reliability of the Chainlink function

Your HTTP can fail and should have a retry policy. The limits of Chainlink functions at the moment is that it allows maximum 5 HTTP calls, so that means 4 retries after failure. Also the timeout is set quite strict to 3 seconds, which means you probably want to cache it and if you do a call that changes some state make the call idempotent (you can call it many times, but the results stays the same)

## Commands

### Simulate

```
npm run simulate
```

### Deploy and verify on Avalanche Fuji

Deploy CardClub.sol with the following command:

```
npx hardhat functions-deploy-client --network avalancheFuji --verify true
```

After you see the deployed contract address, go and approve $Link (normally this happens in the UI with an approval flow)

https://testnet.snowtrace.io/token/0x0b9d5d9136855f6fec3c0993fee6e9ce8a297846?a=0xf4e20531cd11fb8b70896aa9710fedbeb9be87c3#writeContract

Next we register our functions billing subscription and we fund it with 0.25 Link (this is enough, because everybody will pay for their own usage)

```
npx hardhat functions-sub-create --network avalancheFuji --amount 0.5 --contract 0x8B5d01E6A0D7E996FA6Cd046E39a46fE9d515F8F
```

Finally you can do an ad buy function request (with hardcoded publisherId and linkAmount for now, TODO: make this configurable)

```
npx hardhat functions-request --network avalancheFuji --contract 0x8B5d01E6A0D7E996FA6Cd046E39a46fE9d515F8F --subid 35 --gaslimit 300000
```

### Slither

cd to the node_modules folder (reason: https://stackoverflow.com/questions/73287140/slither-cannot-find-the-dependency-with-openzeppelin) and run the following command:

```
SOLC_VERSION=0.8.18 slither ../contracts/CardClub.sol --exclude-dependencies
```

## TODO

- [x] Extract all the necessary code from the https://github.com/smartcontractkit/functions-hardhat-starter-kit for running Chainlink functions and really understand the whole flow. Also simplify where possible
- [x] Create ad request function
- [x] Add Slither and fix potential security issues in contract CardClub.Sol
- [x] Add Github action simulate
- [x] Add Github action linter
- [x] Add Github action unit tests
- [x] Add logo
- [x] Better README.md
- [x] Add MIT license
- [x] Add Secret for cardclub api access
- [x] Explain design decisions
- [x] Make the hash script source updated by the owner only

## Avalanche Fuji faucet and snowtrace

https://faucets.chain.link/fuji

https://faucet.avax.network/

https://testnet.snowtrace.io/
