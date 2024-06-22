const { ethers } = require("hardhat");
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
require('dotenv').config();

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.API_KEY,
  clientId: process.env.CLIENT_ID,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
  measurementId: process.env.MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function clearUsersCollection() {
  const usersCollection = collection(db, 'users');
  const usersSnapshot = await getDocs(usersCollection);
  const deletePromises = usersSnapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  console.log('*Cleared users collection*\n');
}

async function main() {
  // Clear the users collection
  await clearUsersCollection();

  const deployers = await ethers.getSigners();
  const addresses = deployers.slice(0, 5).map(signer => signer.address);
  //console.log("Addresses of the first five deployers:", addresses);
  // the last user is me
  for (let i = 0; i < 6; i++) {
    const signer = deployers[i];
    const VotingSystem = await ethers.getContractFactory("VotingSystem", signer);
    const votingSystem = await VotingSystem.deploy();

    await votingSystem.deploymentTransaction().wait();
    const contractAddress = await votingSystem.getAddress();
    console.log(`Contract deployed!`);

    // const votingSystemArtifactPath = "./artifacts/contracts/VotingSystem.sol/VotingSystem.json";
    // const votingSystemArtifact = JSON.parse(fs.readFileSync(votingSystemArtifactPath, 'utf8'));
    // const abi = votingSystemArtifact.bytecode;
    // need to check if it sppuse to change after each run
    const signerAddressLowercase = signer.address.toLowerCase();
    const contractAddressLowercase = contractAddress.toLowerCase();

    // Create new document in the users collection
    const userRef = doc(db, 'users', signerAddressLowercase);
    await setDoc(userRef, {
      address: signerAddressLowercase,
      contractAddress: contractAddressLowercase,
      group: []       // Initially no participants
    });
    console.log(`User ${signerAddressLowercase} saved to Firebase with contract address ${contractAddressLowercase}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
