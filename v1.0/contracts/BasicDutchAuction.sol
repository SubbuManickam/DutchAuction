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
    uint256 curPrice;

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

    function currentPrice() public view returns(uint256){
        return initialPrice - ((block.number - initialBlock) * offerPriceDecrement);
    }

    function bid() public payable returns(address) {
        require(msg.sender != seller, "Sellers are not allowed to buy");

        curPrice = currentPrice();
        buyer = msg.sender;
        bids[buyer] = msg.value;
        require(msg.value >= curPrice, "Insufficient Amount");
        require(winner == address(0x0), "Auction Concluded");
        
        winner = msg.sender;
        seller.transfer(msg.value);

        return winner;
    }
}
