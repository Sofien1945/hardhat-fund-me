// SPDX-License-Identifier: MIT

// Get funds from users
// Withdraw funds to owner
// Set a minimun funding value in USD

//Following solidity Style Recommendations
//1. Pragma
pragma solidity ^0.8.0;

//2. Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

//3. ERROR codes
error FundMe__NotOwner();

//4. Interfaces, Libraries, Contracts

/**
 * @title A contract for crowdfundng
 * @author Sofien Abidi (Part of Patrick Collins Blockchain, Solidity, and Full Stack Web3 Development Course on FreeCodeCAmp Youtube Channel)
 * @notice This contract is a tutorial for Web3 full stack dev
 * @dev Conversion Toke/USD have been made using chainlink pricefeed
 */
contract FundMe {
    //4.1 Type Decalaration
    using PriceConverter for uint256;

    //4.2 State Variables
    address private immutable i_owner;
    address[] private s_funders;
    uint256 private s_totalFunded;

    uint256 public constant MINIMUM_USD = 3 * 10**18;
    mapping(address => uint256) private s_addressToAmountFunded;

    AggregatorV3Interface private s_priceFeed;

    //4.3 Modifiers
    modifier onlyOwner() {
        //require (msg.sender == i_owner, "You are not the owner of the contract");
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    //4.4 Functions
    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    // Use case : sending ETH to contract without calling Fund Function (through Metamask Send Button for instance)
    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {
        require(
            msg.value.getConvertionRate(s_priceFeed) > MINIMUM_USD,
            "You need to spend more Money!!"
        );
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_totalFunded += msg.value;
    }

    function getVersion() public view returns (uint256) {
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(0x8A753747A1Fa494EC906cE90E9f37563A8AF630e);
        return (s_priceFeed.version());
    }

    function withdraw() public onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_totalFunded = 0;
        //Reset funcers array
        s_funders = new address[](0);
        //Withdraw funds using transfer method
        payable(msg.sender).transfer(address(this).balance);
        //Withdraw funds using send method
        bool sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess, "SEND operation failed");
        //Withdraw funds using call method
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "CALL operation failed");
    }

    function cheepWithdraw() public onlyOwner {
        address[] memory funders = s_funders;
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_totalFunded = 0;

        //Reset funders array
        s_funders = new address[](0);
        //Withdraw funds using transfer method
        payable(msg.sender).transfer(address(this).balance);
        //Withdraw funds using send method
        bool sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess, "SEND operation failed");
        //Withdraw funds using call method
        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "CALL operation failed");
    }

    function balance() public view returns (uint256) {
        return address(this).balance;
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunders(uint256 funderIndex) public view returns (address) {
        return s_funders[funderIndex];
    }

    function getTotalFunded() public view returns (uint256) {
        return s_totalFunded;
    }

    function getAddressToAmountFunded(address funderAddress)
        public
        view
        returns (uint256)
    {
        return s_addressToAmountFunded[funderAddress];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
