import './App.css';
import { ethers } from 'ethers';
import { useState } from 'react';
import abi from './utils/DutchAuctionParameters.json';


function App() {

  const [walletAddress, setWalletAddress] = useState(null);
  const contractAbi = abi.abi;
  const contractByteCode = abi.bytecode;
  const [contractAddress, setContractAddress] = useState(null);
  const [userBalance, setUserBalance] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [ERC721Parameters, setContractParameters] = useState({
    reservePrice: "",
    numBlocksAuctionOpen: "",
    offerPriceDecrement: ""
  })
  const [contractShowUpDetails, setContractShowUpDetails] = useState({
    winner: "",
    currentPriceVal: "",
    reservePriceVal: "",
    numBlocksAuctionOpenVal: "",
    offerPriceDecrementVal: "",
    auctionStatus: ""
  })

  const [bidAmount, setBidAmount] = useState({
    "bidValue": "",
    "contractAddr": ""
  });

  const [contractDisplay, setContractDisplay] = useState({
    "contractAddrDisplay": ""
  })

  const connectWallet = () => {
    if (window.ethereum) {
      window.ethereum.request({ method: 'eth_requestAccounts' })
        .then(result => {
          if (result.length != 0) {
            setWalletAddress([result[0]]);
            getCurrentBalance(result[0]);
            console.log(walletAddress);
          }
          else
            console.error("No authorized account found");
        })
    } else {
      setErrorMessage('Please install MetaMask');
    }
  }
  const getCurrentBalance = (accountAddress) => {
    window.ethereum.request({ method: 'eth_getBalance', params: [String(accountAddress), "latest"] })
      .then(balance => {
        setUserBalance(ethers.utils.formatEther(balance));
      })
  }

  const deployAuctionContract = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log("Hello")
    console.log(setContractParameters);
    console.log(signer);
    const dutchAuctionContractFactory = new ethers.ContractFactory(contractAbi, contractByteCode, signer);
    console.log(dutchAuctionContractFactory)
    console.log(ERC721Parameters.reservePrice);
    const dutchAuctionContract = await dutchAuctionContractFactory.deploy(ERC721Parameters.reservePrice, ERC721Parameters.numBlocksAuctionOpen, ERC721Parameters.offerPriceDecrement);
    setContractAddress(dutchAuctionContract.address);
    let currPrc = await dutchAuctionContract.currentPrice();
    console.log(contractAddress)
    console.log(parseInt(currPrc, 10));
  }

  const contractValueHandler = (e) => {
    setContractParameters({
      ...ERC721Parameters,
      [e.target.name]: e.target.value
    });
  };

  const changeBidAmt = (e) => {
    setBidAmount({
      ...bidAmount,
      [e.target.name]: e.target.value
    });
    console.log(bidAmount)
  };

  const changeAddressDetails = (e) => {
    setContractDisplay({
      ...contractDisplay,
      [e.target.name]: e.target.value
    });
  }

  const showContractDetails = async (e) => {
    e.preventDefault();
    try {
      console.log(contractDisplay)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer);
      const contractDetails = new ethers.Contract(contractDisplay.contractAddrDisplay, contractAbi, signer);
      console.log(contractDetails)
      var winner = await contractDetails.buyer();
      var auctionStatus = "Closed";
      console.log(winner);
      const currentAuctionPrice = await contractDetails.currentPrice();
      console.log(parseInt(currentAuctionPrice, 10));
      var reservePricetemp = await contractDetails.reservePrice();
      var offerPriceDecrementtemp = await contractDetails.offerPriceDecrement();
      var numBlocksAuctionOpentemp = await contractDetails.numBlockAuctionOpen();
      console.log(parseInt(reservePricetemp, 10));

      if (winner == "0x0000000000000000000000000000000000000000") {
        winner = "No winner declared";
        auctionStatus = "Open";
      }

      setContractShowUpDetails({
        winner: winner,
        currentPriceVal: parseInt(currentAuctionPrice, 10),
        reservePriceVal: parseInt(reservePricetemp, 10),
        numBlocksAuctionOpenVal: parseInt(numBlocksAuctionOpentemp, 10),
        offerPriceDecrementVal: parseInt(offerPriceDecrementtemp, 10),
        auctionStatus: auctionStatus
      })
    } catch (error) {
      window.alert(error.reason)
    }
  }

  console.log(contractShowUpDetails.currentPriceVal);
  console.log(contractShowUpDetails.reservePriceVal);
  console.log(contractShowUpDetails.numBlocksAuctionOpenVal);
  console.log(contractShowUpDetails.offerPriceDecrementVal);

  const bidFunction = async (e) => {
    try {
      console.log(bidAmount)
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log(signer);
      const auctionContract = new ethers.Contract(bidAmount.contractAddr, contractAbi, signer);
      console.log(auctionContract)
      const transaction = await auctionContract.bid({ value: bidAmount.bidValue });
      window.alert("Bid Successfully Placed, winner will be announced soon");
    } catch (error) {
      window.alert(error.reason)
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <u><h3>Connect Wallet</h3></u>
        <div>
          <button onClick={connectWallet} style={{ color: "yellow", background: "black", cursor: "pointer" }}>Connect</button>
          <p><b>Account Address:</b> {walletAddress}</p>
          <p><b>Account Balance:</b> {userBalance} ETH</p>
        </div>
        {
          errorMessage
        }
        <u><h3>Deploy Contract</h3></u>
        <div>
          <label for="Reserve Price" > <b>Reserve Price:</b> </label> <input type="number" value={ERC721Parameters.reservePrice} name="reservePrice" onChange={contractValueHandler} />
          <p><label for='Block count' > <b>Number of blocks auction is open:</b> </label> <input type='number' value={ERC721Parameters.numBlocksAuctionOpen} name="numBlocksAuctionOpen" onChange={contractValueHandler} /></p>
          <p><label for='Price Decrement' > <b>Offer Price Decrement:</b> </label> <input type='number' value={ERC721Parameters.offerPriceDecrement} name="offerPriceDecrement" onChange={contractValueHandler} /></p>
          <button onClick={deployAuctionContract} style={{ color: "yellow", background: "black", cursor: "pointer" }}>Deploy</button>
          <p><b>Address of the deployed contract:</b> {contractAddress}</p>
        </div>
        <u><h3>Auction Details</h3></u>
        <div>
          <div>
            <label for="Contract Address" > <b>Contract Address:</b> </label> <input name="contractAddrDisplay" value={contractDisplay.contractAddrDisplay} onChange={changeAddressDetails} />
          </div>
          <div>
            <button onClick={showContractDetails} style={{ color: "yellow", background: "black", cursor: "pointer" }}>Show Info</button>
          </div>
          <div style={{ overflow: "hidden", width: "auto" }}>
            <p><b>Winner:</b> {contractShowUpDetails.winner}</p>
            <p><b>Reserve Price:</b> {contractShowUpDetails.reservePriceVal}</p>
            <p><b>Number of blocks auction is open:</b> {contractShowUpDetails.numBlocksAuctionOpenVal}</p>
            <p><b>Offer Price Decrement:</b> {contractShowUpDetails.offerPriceDecrementVal}</p>
            <p><b>Current Price:</b> {contractShowUpDetails.currentPriceVal}</p>
            <p><b>Auction Status:</b> {contractShowUpDetails.auctionStatus}</p>
          </div>
        </div>
        <u><h3>Place a Bid</h3></u>
        <div>
          <label for="Contract Address" > <b>Contract Address:</b> </label> <input name="contractAddr" value={bidAmount.contractAddr} onChange={changeBidAmt} />
          <p><label for="Bid Amount" > <b>Bid Amount:</b> </label> <input name="bidValue" value={bidAmount.bidValue} onChange={changeBidAmt} /></p>
          <div>
            <button onClick={bidFunction} style={{ color: "yellow", background: "black", cursor: "pointer" }}>Bid</button>
          </div><br />
        </div>
      </header>
    </div>
  );
}

export default App;
