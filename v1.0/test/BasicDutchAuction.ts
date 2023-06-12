import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("BasicDutchAuction", function () {
  async function deployAuctionFixture() {
    
    const [owner, buyer1, buyer2] = await ethers.getSigners();

    const basicDutchAuctionFactory = await ethers.getContractFactory("BasicDutchAuction");
    const basicDutchAuctionToken = await basicDutchAuctionFactory.deploy(100, 10, 10);

    return { basicDutchAuctionToken, owner, buyer1, buyer2 };
  }

  describe("Deployment", function () {

    it("Bid from the seller account", async function () {
      const { basicDutchAuctionToken, owner } = await loadFixture(deployAuctionFixture);

      expect(basicDutchAuctionToken.connect(owner.address).bid({value:200})).to.be.revertedWith('Sellers are not allowed to buy');
    });

    it("Bid from buyer account - Equal to the current price", async function () {
      const { basicDutchAuctionToken, owner, buyer1 } = await loadFixture(deployAuctionFixture);

      expect(basicDutchAuctionToken.connect(buyer1.address).bid({from: buyer1.address, value: 200 }));
    });

    it("Bid from buyer account - Less than the price", async function () {
      const { basicDutchAuctionToken, owner, buyer1 } = await loadFixture(deployAuctionFixture);

      expect(basicDutchAuctionToken.connect(buyer1.address).bid({from: buyer1.address, value: 20 })).to.be.revertedWith('Insufficient Value');
    });
  });

  describe("Auction Conclusion", function () {
    it("Auction Concluded - bid from another buyer", async function () {
      const { basicDutchAuctionToken, owner, buyer1 } = await loadFixture(deployAuctionFixture);

      basicDutchAuctionToken.connect(buyer1.address).bid({from: buyer1.address, value: 200 });
      expect(basicDutchAuctionToken.connect(buyer1.address).bid({from: buyer1.address, value: 200 })).to.be.revertedWith('Auction Concluded');
    });
        
        it("Auction Closed", async function () {
        const { basicDutchAuctionToken, buyer1 } = await loadFixture(deployAuctionFixture);
        
        await time.increase(time.duration.hours(20));
        expect(basicDutchAuctionToken.connect(buyer1.address).bid({from: buyer1.address, value: 200 })).to.be.revertedWith('Auction Closed');
        });
        
        
        it("Bid from buyer account - After the auction is closed", async function () {
        const { basicDutchAuctionToken, buyer1 } = await loadFixture(deployAuctionFixture);
        
        await time.increase(time.duration.days(10));
        
        expect(basicDutchAuctionToken.connect(buyer1.address).bid({from: buyer1.address, value: 400 })).to.be.revertedWith('Auction Closed');
        });
        
        it("Bid from buyer account - After the auction has been concluded", async function () {
        const { basicDutchAuctionToken, owner, buyer1 } = await loadFixture(deployAuctionFixture);
        
        basicDutchAuctionToken.connect(buyer1.address).bid({from: buyer1.address, value: 400 });
        
        expect(basicDutchAuctionToken.connect(owner.address).bid({from: owner.address, value: 400 })).to.be.revertedWith('Auction Concluded');
        });
        
        
        it("Auction Concluded - Bid from buyer after auction is concluded", async function () {
        const { basicDutchAuctionToken, buyer1 } = await loadFixture(deployAuctionFixture);
        
          // Move time forward to end the auction
          await time.increase(time.duration.hours(10));
        
          expect(basicDutchAuctionToken.connect(buyer1.address).bid({from: buyer1.address, value: 200 })).to.be.revertedWith('Auction Concluded');
        });
        
        it("Auction Closed - Bid from buyer after auction is closed", async function () {
          const { basicDutchAuctionToken, buyer1 } = await loadFixture(deployAuctionFixture);
          
          // Move time forward to end the auction
          await time.increase(time.duration.hours(20));
        
          expect(basicDutchAuctionToken.connect(buyer1.address).bid({from: buyer1.address, value: 200 })).to.be.revertedWith('Auction Closed');
        });
        });

    describe("Refund Process", function () {
        it("Refund process for winner", async function () {
            const { basicDutchAuctionToken, owner, buyer1 } = await loadFixture(deployAuctionFixture);
      
            basicDutchAuctionToken.connect(buyer1.address).bid({from: buyer1.address, value: 200 });
            expect(basicDutchAuctionToken.connect(buyer1.address).refundBid({from: buyer1.address })).to.be.revertedWith('You are the winning bidder');
          });

        it("Refund process for other buyers", async function () {
            const { basicDutchAuctionToken, owner, buyer1, buyer2 } = await loadFixture(deployAuctionFixture);
      
            basicDutchAuctionToken.connect(buyer1.address).bid({from: buyer1.address, value: 200 });
            expect(basicDutchAuctionToken.connect(buyer2.address).refundBid({from: buyer1.address }));
          });
    });
  });