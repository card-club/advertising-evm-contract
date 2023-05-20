# Card.Club Advertising Chainlink Functions - SpaceAndTime - EVM smart contract

Basically this smart contract will be used to create:

- register advertising platform (pure solidity)
- create an ad request with fair pricing (limited by historic card.club game/story statistics, doesn't make sense to buy more advertising than is possible to deliver) (chainlink function/solidity)
- approving ad request (so we can prevent malicious ads and we can see who approved the ad, but also reward them for the approving work) (pure solidity)
- approved ads get queried by spaceandtime and will be used in card.club games/stories

This project will use Hardhat (because of the Chainlink functions integration) and Foundry (pure solidity code) development flow.

https://hardhat.org/hardhat-runner/docs/getting-started#overview
https://book.getfoundry.sh/

1. Extract all the necessary code from the https://github.com/smartcontractkit/functions-hardhat-starter-kit for running Chainlink functions and really understand the whole flow
2. Create register function
3. Create ad request function
4. Create approving ad request function
5. Testing:
   1. Good testing suite (including Stateless and Stateful Fuzz Tests and integration tests)
   2. Static analysis tooling passing
   3. Invariants formalized
   4. Good documentation
   5. Release, Maintenance and Recovery plans in place
