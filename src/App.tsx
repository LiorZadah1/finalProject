//import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMetaMask } from "metamask-react";
import HomePage from './components/HomePage';
import ElectionForm from './components/ElectionForm';
import VoteResults from './components/ResultsComponent';
import UserManagement from './components/ManagementComponent';
import { db } from './firebaseConfig'; // Your Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';


const App = () => {
  const { status, connect, account, chainId, ethereum } = useMetaMask();

  const deployAndConnect = async () => {
    const { connect, ethereum } = useMetaMask();

    try {
        // Attempt to connect to MetaMask
        await connect();  // This uses MetaMask's connect function which prompts the user

        // Check if the connection was successful
        if (ethereum.isConnected()) {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = provider.getSigner();

            // Using ABI and bytecode from the deployed contract!!!!!!!!!!!!!!!!!!!!!!
            const abi = contractArtifact.abi;
            const bytecode = contractArtifact.bytecode;

            // Deploy the contract
            const contractFactory = new ethers.ContractFactory(abi, bytecode, signer);
            const contract = await contractFactory.deploy();
            await contract.deployed();

            // Save the contract address and ABI to Firestore
            const contractData = {
                address: contract.address,
                abi: JSON.stringify(abi)  // Storing ABI as a string in Firestore
            };
            // insert to data base
            await setDoc(doc(db, "contracts", contract.address), contractData);

            console.log('Contract deployed and data saved:', contractData);
        } else {
            throw new Error("Failed to connect to MetaMask");
        }
    } catch (error) {
        console.error('Failed to connect and deploy contract:', error);
    }
};


  // Rendering based on connection status
  if (status === "initializing") return <div>Synchronisation with MetaMask ongoing...</div>;
  if (status === "unavailable") return <div>MetaMask not available</div>;
  if (status === "notConnected") return <button onClick={deployAndConnect}>Connect to MetaMask</button>;
  if (status === "connecting") return <div>Connecting...</div>;
  if (status === "connected") {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/election-form" element={<ElectionForm />} />
          <Route path="/vote-results" element={<VoteResults />} />
          <Route path="/user-management" element={<UserManagement />} />
        </Routes>
      </Router>
    );
  }

  return <div>An unknown error occurred.</div>;
};

export default App;
