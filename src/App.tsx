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

const App = () => {
  const { status, connect, account } = useMetaMask();
  const [loading] = useState(false);
  const [isValidUser, userLoading] = useCheckUser();

  if (status === "initializing") return <div>Synchronisation with MetaMask ongoing...</div>;
  if (status === "unavailable") return <div>MetaMask not available</div>;
  if (status === "notConnected") return (
    <Container maxWidth="sm" style={{ marginTop: '2rem' }}>
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Voting System
      </Typography>
      <Typography variant="h3" component="h1" gutterBottom>
          Welcome to the Voting System
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Secure, Transparent, and Decentralized Voting
        </Typography>
      <Button
        onClick={connect}
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
      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Voting System
      </Typography>
      <Typography variant="h3" component="h1" gutterBottom>
          Welcome to the Voting System
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Secure, Transparent, and Decentralized Voting
        </Typography>
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
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Voting System
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            <Box>
              <Button color="inherit" href="/vote-table">Votes Table</Button>
              {isValidUser && !userLoading && (
                <Button color="inherit" href="/create-vote">Create New Vote</Button>
              )}
              <Button color="inherit" href="/vote-results">Vote Results</Button>
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
