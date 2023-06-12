//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

contract BasicDutchAuction {

    address payable public seller;
    address public buyer = address(0x0);
    address public winner = address(0x0);

    uint256 immutable reservePrice;
    uint256 numBlockAuctionOpen;
    uint256 immutable offerPriceDecrement;
    uint256 immutable initialPrice;

    uint256 immutable initialBlock;
    uint256 endBlock;

    mapping(address => uint256) public bids;

    constructor(uint256 _reservePrice, uint256 _numBlocksAuctionOpen, uint256 _offerPriceDecrement) {
        reservePrice = _reservePrice;
        numBlockAuctionOpen = _numBlocksAuctionOpen;
        offerPriceDecrement = _offerPriceDecrement;
        seller = payable(msg.sender);
        initialPrice = _reservePrice + (_numBlocksAuctionOpen * _offerPriceDecrement);
        initialBlock = block.number;
        endBlock = block.number + numBlockAuctionOpen;
    }

    function bid() public payable returns(address) {
        require(buyer == address(0x0), "Auction Concluded");
        require(msg.sender != seller, "Sellers are not allowed to buy");
        require(block.number < endBlock, "Auction Closed");

        buyer = msg.sender;
        bids[buyer] = msg.value;
        uint256 curPrice = initialPrice - ((block.number - initialBlock) * offerPriceDecrement);
        require(msg.value >= curPrice, "Insufficient Value");

        winner = msg.sender;
        seller.transfer(msg.value);

        return winner;
    }

    function refundBid() public {
        require(msg.sender != winner, "You are the winning bidder");

        uint256 refundAmount = bids[msg.sender];
        bids[msg.sender] = 0;
        payable(msg.sender).transfer(refundAmount);
    }

}
