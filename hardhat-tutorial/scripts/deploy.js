const { ethers } = require("hardhat");
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
require('dotenv').config();

// Initialize Firebase
// const firebaseConfig = {
//   apiKey: process.env.API_KEY,
//   clientId: process.env.CLIENT_ID,
//   authDomain: process.env.AUTH_DOMAIN,
//   projectId: process.env.PROJECT_ID,
//   storageBucket: process.env.STORAGE_BUCKET,
//   messagingSenderId: process.env.MESSAGING_SENDER_ID,
//   appId: process.env.APP_ID,
//   measurementId: process.env.MEASUREMENT_ID
// };
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

async function clearCollection(collectionName) {
  const collectionRef = collection(db, collectionName);
  const snapshot = await getDocs(collectionRef);
  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
  console.log(`*Cleared ${collectionName} collection*\n`);
}

async function resetCurrentID() {
  const currentIDRef = doc(db, 'votesID', 'currentID');
  await setDoc(currentIDRef, { currentID: 0 });
  console.log('*Reset currentID in votesID collection*\n');
}

async function main() {
  // Clear the users collection
  await clearCollection('voteManagers');
  await clearCollection('usersVotes');

  // Reset currentID in votesID collection
  await resetCurrentID();

  const deployers = await ethers.getSigners();
  const addresses = deployers.slice(0, 5).map(signer => signer.address);
  
  for (let i = 0; i < 6; i++) {
    const signer = deployers[i];
    const VotingSystem = await ethers.getContractFactory("VotingSystem", signer);
    const votingSystem = await VotingSystem.deploy();

    await votingSystem.deploymentTransaction().wait();
    const contractAddress = await votingSystem.getAddress();
    console.log(`Contract deployed!`);

    const signerAddressLowercase = signer.address.toLowerCase();
    const contractAddressLowercase = contractAddress.toLowerCase();

    // Create new document in the voteManagers collection
    const userRef = doc(db, 'voteManagers', signerAddressLowercase);
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