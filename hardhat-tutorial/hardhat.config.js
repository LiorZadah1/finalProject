require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
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
        accounts: ["0x1934a25de6a1938e3eae0b1f9e602138ce54883bd2f85abe8e771d0a9a6dc9c3", "0x69666b6bb870655cb3fbb8f53a90c106a41daa4532cdce2e66a9f57e74d748a7", "0xc71c0a5010ae99fb12db196f5fb8e856b6acc557b9b1e7d2277b4d9c5384fbe9", "0x8173827ab5bcc294aade207f324fc3ed45aeac0ec6298056ded3b5c74b58fd24", "0x9be7daf184e8ab97ba05a0266ad4d1328dd84802185bf6526c46a8470a51a226", "0xc954fd0b93f69807d9748dfd2c85e6c4da39a6af29bc508842af13c7291219c6"]
      },
      localhost: {
        url: "http://127.0.0.1:7545",
        accounts: ["0x1934a25de6a1938e3eae0b1f9e602138ce54883bd2f85abe8e771d0a9a6dc9c3", "0x69666b6bb870655cb3fbb8f53a90c106a41daa4532cdce2e66a9f57e74d748a7", "0xc71c0a5010ae99fb12db196f5fb8e856b6acc557b9b1e7d2277b4d9c5384fbe9", "0x8173827ab5bcc294aade207f324fc3ed45aeac0ec6298056ded3b5c74b58fd24", "0x9be7daf184e8ab97ba05a0266ad4d1328dd84802185bf6526c46a8470a51a226", "0xc954fd0b93f69807d9748dfd2c85e6c4da39a6af29bc508842af13c7291219c6"]
      }
  },
};
