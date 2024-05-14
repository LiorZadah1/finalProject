import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useMetaMask } from "metamask-react";
import HomePage from './components/HomePage';
//import VoteTable from './components/VoteTable';
import ElectionForm from './components/ElectionForm';
import VotingProcess from './components/VotingComponent';
import VoteResults from './components/ResultsComponent';
import UserManagement from './components/ManagementComponent';

const App = () => {
  const { status, connect, account, chainId } = useMetaMask();

  if (status === "initializing") return <div>Synchronisation with MetaMask ongoing...</div>;
  if (status === "unavailable") return <div>MetaMask not available :(</div>;
  if (status === "notConnected") return <button onClick={connect}>Connect to MetaMask</button>;
  if (status === "connecting") return <div>Connecting...</div>;
  if (status === "connected") {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/election-form" element={<ElectionForm />} />
          <Route path="/voting-process" element={<VotingProcess />} />
          <Route path="/vote-results" element={<VoteResults />} />
          <Route path="/user-management" element={<UserManagement />} />
        </Routes>
      </Router>
    );
  }

  return <div>An unknown error occurred.</div>;
};

export default App;
