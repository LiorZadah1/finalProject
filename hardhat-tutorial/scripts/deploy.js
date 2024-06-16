// const { ethers } = require("hardhat");
// const fs = require('fs');

// async function main() {
//   const [deployer] = await ethers.getSigners();
//   console.log("Deploying contracts with the account:", deployer.address);

//   const VotingSystem = await ethers.getContractFactory("VotingSystem");
//   const votingSystem = await VotingSystem.deploy();
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });

const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  // Read users from the users.json file
  const users = JSON.parse(fs.readFileSync('users.json', 'utf8'));

  for (let user of users) {
    // Create a Wallet instance from the private key
    const wallet = new ethers.Wallet(user.privateKey, ethers.provider);

    console.log(`Deploying contract for ${user.userId} with address ${wallet.address}`);

    // Deploy contract for each user
    const VotingSystem = await ethers.getContractFactory("VotingSystem", wallet);
    const votingSystem = await VotingSystem.deploy();

    // Wait for the deployment transaction to be mined
    await votingSystem.deploymentTransaction().wait();

    const contractAddress = await votingSystem.getAddress();

    console.log(`Contract deployed at address: ${contractAddress}`);

    // Update user data with the contract address
    user.contractAddress = contractAddress;
  }

  // Write updated users data back to users.json
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
  console.log('Users and contract addresses updated in users.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



