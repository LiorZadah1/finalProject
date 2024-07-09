import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMetaMask } from "metamask-react";
import VoteTable from './components/VoteTable';
import HomePage from './components/HomePage';
import CreateVote from './components/CreateVote';
import VoteResults from './components/ResultsComponent';
import VotingComponent from './components/VotingComponent';
import UserManagement from './components/ManagementComponent';
import { AppBar, Toolbar, Typography, Button, CircularProgress, Container, Box } from '@mui/material';
import useCheckUser from './utils/checkUser';
import './App.css';

const App = () => {
  const { status, connect, account } = useMetaMask();
  const [loading] = useState(false);
  const [isValidUser, userLoading] = useCheckUser();

  if (status === "initializing") return <div>Synchronisation with MetaMask ongoing...</div>;
  if (status === "unavailable") return <div>MetaMask not available</div>;
  if (status === "notConnected") return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        textAlign="center"
        bgcolor="#f0f0f0"
        padding={4}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ 
            fontWeight: 'bold', 
            color: '#1976d2', 
            marginBottom: 2 
          }}
        >
          Welcome to the Blockchain-based Voting System
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ 
            color: '#555', 
            marginBottom: 4 
          }}
        >
          Secure, Transparent, and Decentralized Voting
        </Typography>
        <Button
          onClick={connect}
          variant="contained"
          color="primary"
          style={{
            padding: '1rem',
            fontSize: '1.2rem',
            backgroundColor: '#3f51b5',
            color: '#fff',
            textTransform: 'none',
            boxShadow: '0 3px 5px 2px rgba(63, 81, 181, .3)',
            width: 'auto'
          }}
        >
          Connect to MetaMask
        </Button>
        </Box>
    </>
  );
  
  if (status === "connecting") return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
        textAlign="center"
        bgcolor="#f0f0f0"
        padding={4}
      >
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ 
            fontWeight: 'bold', 
            color: '#1976d2', 
            marginBottom: 2 
          }}
        >
          Welcome to the Blockchain-based Voting System
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ 
            color: '#555', 
            marginBottom: 4 
          }}
        >
          Secure, Transparent, and Decentralized Voting
        </Typography>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{ 
            color: '#555', 
            marginBottom: 4 
          }}
        >
          Connecting - Please check your MetaMask extention.
        </Typography>
        </Box>
    </>
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
            <Box sx={{ flexGrow: 1 }} />
            <Box>
              <Button color="inherit" href="/vote-table">Voting Table</Button>
              {isValidUser && !userLoading && (
                <Button color="inherit" href="/create-vote">Create New Vote</Button>
              )}
              <Button color="inherit" href="/vote-results">Votes Result</Button>
              <Button color="inherit" href="/user-management">User Management</Button>
            </Box>
          </Toolbar>
        </AppBar>
        <Container>
          <Routes>
            <Route path="/" element={<HomePage status={''} account={null} connect={function (): Promise<void> {
              throw new Error('Function not implemented.');
            } } />} />
            <Route path="/vote-table" element={<VoteTable />} />
            <Route path="/create-vote" element={<CreateVote />} />
            <Route path="/voting-component/:voteID" element={<VotingComponent />} />
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
