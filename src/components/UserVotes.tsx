import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createContract } from '../utils/createContract';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useMetaMask } from "metamask-react";
import VotingSystem from "../../hardhat-tutorial/artifacts/contracts/VotingSystem.sol/VotingSystem.json";

import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Fab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface Vote {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const UserVotes: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status, account } = useMetaMask();

  useEffect(() => {
    async function fetchData() {
      try {
        if (status === "connected" && account) {
          const docRef = doc(db, 'users', account);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            throw new Error('No contract information available!');
          }
          const abi = VotingSystem.abi;
          const { contractAddress, group } = docSnap.data();
          if (!abi || !contractAddress) {
            throw new Error('Contract ABI or address is missing.');
          }

          const contractInstance = await createContract(window.ethereum, contractAddress, abi);
          await fetchUserVotes(contractInstance);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Failed to load contract:', error.message);
          setError(error.message);
        } else {
          console.error('An unexpected error occurred');
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    async function fetchUserVotes(contract: ethers.Contract) {
      // const userAddress = await contract.getAddress;
      //Switch to working in the longer way because we didnt found getAddress();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress()
      const userVotes = await contract.getUserVotes(userAddress);
      const formattedVotes = userVotes.map((vote: any) => ({
        id: vote.id.toString(),
        name: vote.name,
        startDate: new Date(vote.startDate * 1000).toISOString(),
        endDate: new Date(vote.endDate * 1000).toISOString(),
      }));
      setVotes(formattedVotes);
    }

    fetchData();
  }, [status, account]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
          <Typography>Loading user votes...</Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        My Created Votes
      </Typography>
      {votes.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {votes.map((vote) => (
                <TableRow key={vote.id}>
                  <TableCell>{vote.name}</TableCell>
                  <TableCell>{vote.startDate}</TableCell>
                  <TableCell>{vote.endDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" component="p">
          No votes created yet.
        </Typography>
      )}
      <Fab color="primary" aria-label="add" style={{ position: 'fixed', bottom: 16, right: 16 }}>
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default UserVotes;
