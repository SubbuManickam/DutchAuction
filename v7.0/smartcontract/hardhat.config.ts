import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const INFURA_API_KEY = "a36a101972644d9282a57a5713d32c7b";

const SEPOLIA_PRIVATE_KEY = "4bb9ff70c81d49d8302521afa024575939087860c1c97a76f8f1d3da9baa5495";

module.exports = {
  solidity: "0.8.19",
  networks: {
    sepolia: {
      url: `https://sepolia.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    }
  },
};