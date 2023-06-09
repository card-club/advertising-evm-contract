// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import {Functions, FunctionsClient} from "./dev/functions/FunctionsClient.sol";
// import "@chainlink/contracts/src/v0.8/dev/functions/FunctionsClient.sol"; // Once published
import {ConfirmedOwner} from "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/interfaces/LinkTokenInterface.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC1363} from "@openzeppelin/contracts/interfaces/IERC1363.sol";

error CardClub_LinkAmountToLow();
error CardClub_payLinkForAdFailed();
error CardClub_payLinkForRegistryFailed();
error CardClub_invalidSource();
error CardClub_refundFailedContactUs();

contract CardClub is FunctionsClient, ConfirmedOwner {
    using Functions for Functions.Request;

    address internal immutable linkAddress;
    address internal immutable linkBillingProxyAddress;
    bytes32 internal sourceHash;
    uint256 internal constant LINK_DIVISIBILITY = 10 ** 18;

    mapping(bytes32 => address) public requestWalletAddress;
    mapping(bytes32 => address) public requestPublisherAddress;
    mapping(address => uint256) public requestPublisherBalance;
    mapping(bytes32 => uint256) public requestLinkAmount;

    event OCRResponse(bytes32 indexed requestId, bytes result, bytes err);

    /**
     * @notice Executes once when a contract is created to initialize state variables
     *
     * @param oracle - The FunctionsOracle contract
     * @param linkTokenAddress - Linktoken contract address
     * @param linkBillingRegistryProxyAddress - Link Billing Registry Proxy Contract
     * @param sourceHashValue - JavaScript source hash to prevent people running their own script
     */
    constructor(
        address oracle,
        address linkTokenAddress,
        address linkBillingRegistryProxyAddress,
        bytes32 sourceHashValue
    ) FunctionsClient(oracle) ConfirmedOwner(msg.sender) {
        require(
            linkTokenAddress != address(0),
            "Link token address is not set"
        );
        require(
            linkBillingRegistryProxyAddress != address(0),
            "Functions Billings Registry address is not set"
        );
        linkAddress = linkTokenAddress;
        linkBillingProxyAddress = linkBillingRegistryProxyAddress;
        sourceHash = sourceHashValue;
    }

    /**
     * @notice Send a simple request to purchase an Card Club publisher ad
     *
     * @param linkAmount Link amount to pay for the ad
     * @param source JavaScript source code
     * @param secrets Encrypted secrets payload
     * @param args List of arguments accessible from within the source code (linkAmount and publisherId)
     * @param subscriptionId Funtions billing subscription ID
     * @param gasLimit Maximum amount of gas used to call the client contract's `handleOracleFulfillment` function
     * @return Functions request ID
     */
    function purchaseAd(
        address publisherAddress,
        uint256 linkAmount,
        string calldata source,
        bytes calldata secrets,
        string[] calldata args,
        uint64 subscriptionId,
        uint32 gasLimit
    ) public returns (bytes32) {
        if (keccak256(abi.encodePacked(source)) != sourceHash)
            revert CardClub_invalidSource();

        // Purchase Ad amount should be at least 1 LINK
        if (linkAmount < LINK_DIVISIBILITY) revert CardClub_LinkAmountToLow();
        bool success = IERC20(linkAddress).transferFrom(
            msg.sender,
            address(this),
            linkAmount
        );
        if (!success) revert CardClub_payLinkForAdFailed();

        // Fund subscription
        bool success2 = IERC1363(linkAddress).transferAndCall(
            linkBillingProxyAddress,
            // This is more than enough to cover the current fees 0.2 LINK + transaction cost + variable (depending on gas)
            LINK_DIVISIBILITY / 2,
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
        requestWalletAddress[assignedReqID] = msg.sender;
        requestLinkAmount[assignedReqID] = linkAmount;
        requestPublisherAddress[assignedReqID] = publisherAddress;
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
        emit OCRResponse(requestId, response, err);

        if (err.length > 0) {
            // Refund link
            bool success = IERC20(linkAddress).transferFrom(
                address(this),
                requestWalletAddress[requestId],
                requestLinkAmount[requestId]
            );
            if (!success) revert CardClub_refundFailedContactUs();
        } else {
            // Add it to publisher balance
            unchecked {
                requestPublisherBalance[requestPublisherAddress[requestId]] =
                    requestPublisherBalance[
                        requestPublisherAddress[requestId]
                    ] +
                    (requestLinkAmount[requestId] - (LINK_DIVISIBILITY / 2));
            }
        }
    }

    /**
     * @notice Witdraws LINK from the contract to the Owner
     */
    function withdrawLinkOwner() external onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(linkAddress);
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Forbidden to transfer link to non-owner"
        );
    }

    /**
     * @notice Witdraws LINK from the contract to the Owner
     */
    function withdrawLinkPublisher() external {
        LinkTokenInterface link = LinkTokenInterface(linkAddress);
        requestPublisherBalance[msg.sender] = 0;
        require(
            link.transfer(msg.sender, requestPublisherBalance[msg.sender]),
            "Publisher has no balance"
        );
        require(
            requestPublisherBalance[msg.sender] == 0,
            "Balance should be zero"
        );
    }

    /**
     * @notice Allows the CardClub oracle address to be updated
     *
     * @param oracle New oracle address
     */
    function updateOracleAddress(address oracle) external onlyOwner {
        setOracle(oracle);
    }

    /**
     * @notice Allows the CardClub source hash to be updated
     *
     * @param newSourceHash New source hash
     */
    function updateSourceHash(bytes32 newSourceHash) external onlyOwner {
        sourceHash = newSourceHash;
    }

    function addSimulatedRequestId(
        address oracleAddress,
        bytes32 requestId
    ) external onlyOwner {
        addExternalRequest(oracleAddress, requestId);
    }
}
