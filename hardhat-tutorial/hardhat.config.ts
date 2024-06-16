// require("@nomicfoundation/hardhat-ignition-ethers");
// require("@nomicfoundation/hardhat-toolbox");
// require("@nomicfoundation/hardhat-ethers");
// /** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.8.24",
//   paths: {
//     sources: "./contracts",
//     tests: "./test",
//     cache: "./cache",
//     artifacts: "./artifacts"
//   }
// };
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers"
import "@nomicfoundation/hardhat-ignition-ethers"
const config: HardhatUserConfig = {
  solidity: "0.8.24",
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};

export default config;