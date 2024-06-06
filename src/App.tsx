//import { useState, useEffect } from 'react';
import { ethers , ContractFactory } from 'ethers';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMetaMask } from "metamask-react";
import { db } from './firebaseConfig'; // Your Firebase configuration
//import { initializeApp } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';
import VoteTable from './components/VoteTable';
import ElectionForm from './components/ElectionForm';
import VoteResults from './components/ResultsComponent';
import VotingComponent from './components/VotingComponent';
import UserManagement from './components/ManagementComponent';
import contractArtifact from '../hardhat-tutorial/artifacts/contracts/VotingSystem.sol/VotingSystem.json'



const App = () => {
  const { status, connect, account, ethereum } = useMetaMask();

  const deployAndConnect = async () => {
    //const { connect, ethereum } = useMetaMask();

    try {
        // Attempt to connect to MetaMask
        await connect();  // This uses MetaMask's connect function which prompts the user

        // Check if the connection was successful
        if (ethereum.isConnected() && window.ethereum !== "undefined") {
            const provider = new ethers.BrowserProvider(ethereum);
            const signer = await provider.getSigner();

            // Using ABI and bytecode from the deployed contract
            const abi = contractArtifact.abi;
            const bytecode = contractArtifact.bytecode;

            //Deploy the contract - GPT
            // const contractFactory = new ethers.ContractFactory(abi, bytecode, signer);
            // const contract = await contractFactory.deploy() as ethers.Contract;
            // await contract.deployed();
            
            // Itzhak
              const factory = new ContractFactory(abi, bytecode, signer);      
              const contract = await factory.deploy();
            // Save the contract address and ABI to Firestore
            const contractData = {
                address: contractArtifact.bytecode,
                abi: JSON.stringify(abi)  // Storing ABI as a string in Firestore
            };
            // insert to data base
            // await setDoc(doc(db, "contracts", contract.address), contractData);
            if (typeof account === 'string') {
              const docRef = doc(db, "contracts", account);
              await setDoc(docRef, contractData);
              console.log('Contract deployed and data saved:', contractData);
          } else {
              console.error('Contract address is not a string:', contractArtifact.bytecode);
          }

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
          <Route path="/" element={<VoteTable />} />
          <Route path="/election-form" element={<ElectionForm />} />
          <Route path="/voting-component" element={<VotingComponent />} />
          <Route path="/vote-results" element={<VoteResults />} />
          <Route path="/user-management" element={<UserManagement />} />
        </Routes>
      </Router>
    );
  }

  return <div>An unknown error occurred.</div>;
};

export default App;
