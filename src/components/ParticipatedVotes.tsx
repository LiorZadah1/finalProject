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
} from '@mui/material';

interface Vote {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const ParticipatedVotes: React.FC = () => {
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
          const { contractAddress } = docSnap.data();
          if (!abi || !contractAddress) {
            throw new Error('Contract ABI or address is missing.');
          }

          const contractInstance = await createContract(window.ethereum, contractAddress, abi);
          await fetchParticipatedVotes(contractInstance);
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

    async function fetchParticipatedVotes(contract: ethers.Contract) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      const participatedVoteIDs = await contract.getParticipatedVotes(userAddress);

      const participatedVotes = await Promise.all(
        participatedVoteIDs.map(async (voteID: ethers.BigNumberish) => {
          const voteData = await contract.votes(voteID);
          return {
            id: voteID.toString(),
            name: voteData.voteName,
            startDate: new Date(Number(voteData.startVoteTime) * 1000).toISOString(),
            endDate: new Date((Number(voteData.startVoteTime) + Number(voteData.duration)) * 1000).toISOString(),
          };
        })
      );
      setVotes(participatedVotes);
    }

    fetchData();
  }, [status, account]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
          <Typography>Loading participated votes...</Typography>
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
        Votes I've Participated In
      </Typography>
      {votes.length > 0 ? (
        <TableContainer component={Paper} style={{ marginTop: '20px' }}>
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
          No votes participated in yet.
        </Typography>
      )}
    </Container>
  );
};

export default ParticipatedVotes;
