#  <img src="https://github.com/card-club/advertising-evm-contract/assets/3293323/b16dfaba-961d-4cbd-886f-9b10cf58b10f" width=60>ard.Club - Advertising Proof of concept

## Chainlink Functions - EVM smart contract - SpaceAndTime
Card.Club allows any user to create an ad request with fair pricing based on historic verifiable immutable analytics data and they can verify in the future that they received the views. 

## Design decisions

### Smart Contract

### Chainlink function

### SxT Table design

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
npx hardhat functions-sub-create --network avalancheFuji --amount 0.25 --contract 0x4dd9C6F7D80EE37CEDeccc152e99E3f4403f6C74
```

Finally you can do an ad buy function request (with hardcoded publisherId and linkAmount for now, TODO: make this configurable)

```
npx hardhat functions-request --network avalancheFuji --contract 0x4dd9C6F7D80EE37CEDeccc152e99E3f4403f6C74 --subid 28 --gaslimit 250000
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
- [ ] Explain design decisions (Friday)
- [ ] Clean up of unused files (Weekend)
- [ ] Make functions-request hardhat task accept custom publisherId and linkAmount (Weekend)
- [ ] Add unit tests (Weekend)

## Avalanche Fuji faucet and snowtrace

https://faucets.chain.link/fuji

https://faucet.avax.network/

https://testnet.snowtrace.io/
