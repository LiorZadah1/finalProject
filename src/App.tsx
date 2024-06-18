import { useState } from 'react';
import { ethers, ContractFactory } from 'ethers';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMetaMask } from "metamask-react";
import { db } from './firebaseConfig'; // Your Firebase configuration
import { doc, setDoc } from 'firebase/firestore';
import VoteTable from './components/VoteTable';
import HomePage from './components/HomePage';
import ElectionForm from './components/ElectionForm';
import VoteResults from './components/ResultsComponent';
import VotingComponent from './components/VotingComponent';
import UserManagement from './components/ManagementComponent';
import contractArtifact from '../hardhat-tutorial/artifacts/contracts/VotingSystem.sol/VotingSystem.json';
import { AppBar, Toolbar, Typography, Button, CircularProgress, Container, Box } from '@mui/material';

const App = () => {
  const { status, connect, account, ethereum } = useMetaMask();
  const [loading, setLoading] = useState(false);

  const deployAndConnect = async () => {
    try {
      setLoading(true);
      await connect();

      if (ethereum.isConnected() && window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();

        const abi = contractArtifact.abi;
        const bytecode = contractArtifact.bytecode;

        const factory = new ContractFactory(abi, bytecode, signer);
        const contract = await factory.deploy();

        const contractData = {
          address: contract.target, // Correctly store the deployed contract address
          abi: JSON.stringify(abi)
        };

        if (typeof account === 'string') {
          const docRef = doc(db, "contracts", account);
          await setDoc(docRef, contractData);
          console.log('Contract deployed and data saved:', contractData);
        } else {
          console.error('Contract address is not a string:', contract.target);
        }

        console.log('Contract deployed and data saved:', contractData);
      } else {
        throw new Error("Failed to connect to MetaMask");
      }
    } catch (error) {
      console.error('Failed to connect and deploy contract:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "initializing") return <div>Synchronisation with MetaMask ongoing...</div>;
  if (status === "unavailable") return <div>MetaMask not available</div>;
  if (status === "notConnected") return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Button
        onClick={deployAndConnect}
        variant="contained"
        color="primary"
        fullWidth
        style={{
          padding: '1rem',
          fontSize: '1.2rem',
          backgroundColor: '#3f51b5',
          color: '#fff',
          textTransform: 'none',
          boxShadow: '0 3px 5px 2px rgba(63, 81, 181, .3)'
        }}
      >
        Connect to MetaMask
      </Button>
    </Container>
  );
  if (status === "connecting") return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Box textAlign="center" style={{
        padding: '1rem',
        fontSize: '1.5rem',
        backgroundColor: '#f3f3f3',
        color: '#333',
        borderRadius: '8px',
        boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .2)'
      }}>
        Connecting... Check your MetaMask extension.
      </Box>
    </Container>
  );

  if (status === "connected") {
    console.log('the account you are connected with:', account);
    return (
      <Router>
        <AppBar position="static">
          <Toolbar>
            <Button color="inherit" href="/" style={{ textTransform: 'none' }}>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Voting System
              </Typography>
            </Button>
            <Button color="inherit" href="/vote-table">Votes Table</Button>
            <Button color="inherit" href="/election-form">Election Form</Button>
            <Button color="inherit" href="/voting-component">Voting</Button>
            <Button color="inherit" href="/vote-results">Vote Results</Button>
            <Button color="inherit" href="/user-management">User Management</Button>
          </Toolbar>
        </AppBar>
        <Container>
          <Routes>
            <Route path="/" element={<HomePage status={''} account={null} connect={function (): Promise<void> {
              throw new Error('Function not implemented.');
            } } />} />
            <Route path="/vote-table" element={<VoteTable />} />
            <Route path="/election-form" element={<ElectionForm />} />
            <Route path="/voting-component" element={<VotingComponent />} />
            <Route path="/vote-results" element={<VoteResults />} />
            <Route path="/user-management" element={<UserManagement />} />
          </Routes>
        </Container>
      </Router>
    );
  }

  return loading ? <CircularProgress /> : <div>An unknown error occurred.</div>;
};

export default App;
