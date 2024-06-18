const { ethers } = require("hardhat");
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD1XQNm1iNTKIfDNA36Bx5Ar1OAUB73dOs",
  clientId: "402500146746-ppj3t2kqb520k9t1opsjjdohnge55mij.apps.googleusercontent.com",
  authDomain: "voting-system-80cc2.firebaseapp.com",
  projectId: "voting-system-80cc2",
  storageBucket: "voting-system-80cc2.appspot.com",
  messagingSenderId: "402500146746",
  appId: "1:402500146746:web:f7aeb327e3c2c2a771c703",
  measurementId: "G-VEZFL81GBP"
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

  for (let i = 0; i < 5; i++) {
    const signer = deployers[i];
    const VotingSystem = await ethers.getContractFactory("VotingSystem", signer);
    const votingSystem = await VotingSystem.deploy();

    await votingSystem.deploymentTransaction().wait();
    const contractAddress = await votingSystem.getAddress();
    console.log(`Contract deployed by ${signer.address} at address: ${contractAddress}`);

    const votingSystemArtifactPath = "./artifacts/contracts/VotingSystem.sol/VotingSystem.json";
    const votingSystemArtifact = JSON.parse(fs.readFileSync(votingSystemArtifactPath, 'utf8'));
    const abi = votingSystemArtifact.bytecode;
    // need to check if it sppuse to change after each run
    
    // Create new document in the users collection
    const userRef = doc(db, 'users', signer.address);
    await setDoc(userRef, {
      address: signer.address,
      contractAddress: contractAddress,
      abi: abi,
      group: [] // Initially no participants
    });
    console.log(`User ${signer.address} saved to Firebase with contract address ${contractAddress}\n`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
