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
  },
  networks: {
    ganache: {
        url: "http://127.0.0.1:7545/",
        accounts: ["0x1934a25de6a1938e3eae0b1f9e602138ce54883bd2f85abe8e771d0a9a6dc9c3"]
    },
    localhost: {
      url: "http://127.0.0.1:7545"
    }
}
};

export default config;