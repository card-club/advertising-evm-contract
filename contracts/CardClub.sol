// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";
// import "@chainlink/contracts/src/v0.8/dev/functions/FunctionsClient.sol"; // Once published
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC1363.sol";

error CardClub_LinkAmountToLow();
error CardClub_payLinkForAdFailed();
error CardClub_payLinkForRegistryFailed();
error CardClub_refundFailedContactUs();

contract CardClub is FunctionsClient, ConfirmedOwner {
    using Functions for Functions.Request;

    address internal constant linkAddress =
        0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846;
    uint256 internal constant LINK_DIVISIBILITY = 10 ** 18;

    mapping(bytes32 => address) public requests_wallet_address;
    mapping(bytes32 => uint256) public requests_link_amount;

    event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

    /**
     * @notice Executes once when a contract is created to initialize state variables
     *
     * @param oracle - The FunctionsOracle contract
     */
    // https://github.com/protofire/solhint/issues/242
    // solhint-disable-next-line no-empty-blocks
    constructor(
        address oracle
    ) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {}

    /**
     * @notice Send a simple request
     *
     * @param source JavaScript source code
     * @param secrets Encrypted secrets payload
     * @param args List of arguments accessible from within the source code
     * @param subscriptionId Funtions billing subscription ID
     * @param gasLimit Maximum amount of gas used to call the client contract's `handleOracleFulfillment` function
     * @return Functions request ID
     */
    function purchaseAd(
        uint256 link_amount,
        string calldata source,
        bytes calldata secrets,
        string[] calldata args,
        uint64 subscriptionId,
        uint32 gasLimit
    ) public payable returns (bytes32) {
        // Purchase Ad amount should be at least 1 LINK
        if (link_amount < LINK_DIVISIBILITY) revert CardClub_LinkAmountToLow();
        bool success = IERC20(linkAddress).transferFrom(
            msg.sender,
            address(this),
            link_amount
        );
        if (!success) revert CardClub_payLinkForAdFailed();

        // Fund subscription
        bool success2 = IERC1363(linkAddress).transferAndCall(
            0x452C33Cef9Bc773267Ac5F8D85c1Aca2bA4bcf0C,
            link_amount,
            abi.encode(subscriptionId)
        );

        if (!success2) revert CardClub_payLinkForRegistryFailed();

        Functions.Request memory req;
        req.initializeRequest(
            Functions.Location.Inline,
            Functions.CodeLanguage.JavaScript,
            source
        );
        if (secrets.length > 0) {
            req.addRemoteSecrets(secrets);
        }
        if (args.length > 0) req.addArgs(args);

        bytes32 assignedReqID = sendRequest(req, subscriptionId, gasLimit);
        requests_wallets[assignedReqID] = msg.sender;
        requests_link_amount[assignedReqID] = link_amount;
        return assignedReqID;
    }

    /**
     * @notice Callback that is invoked once the DON has resolved the request or hit an error
     *
     * @param requestId The request ID, returned by sendRequest()
     * @param response Aggregated response from the user code
     * @param err Aggregated error from the user code or from the execution pipeline
     * Either response or error parameter will be set, but never both
     */
    function fulfillRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory err
    ) internal override {
        if (err.length > 0) {
            // Refund link
            bool success = IERC20(linkAddress).transferFrom(
                address(this),
                msg.sender,
                link_amount
            );
            if (!success) revert CardClub_refundFailedContactUs();
        }

        emit OCRResponse(requestId, response, err);
    }

    /**
     * @notice Witdraws LINK from the contract to the Owner
     */
    function withdrawLink() external onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(linkAddress);
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }

    /**
     * @notice Allows the Functions oracle address to be updated
     *
     * @param oracle New oracle address
     */
    function updateOracleAddress(address oracle) public onlyOwner {
        setOracle(oracle);
    }

    function addSimulatedRequestId(
        address oracleAddress,
        bytes32 requestId
    ) public onlyOwner {
        addExternalRequest(oracleAddress, requestId);
    }
}
