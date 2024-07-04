import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { getDoc, doc } from 'firebase/firestore';
import { useMetaMask } from "metamask-react";
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { db } from '../firebaseConfig';
import { createContract } from '../utils/createContract';
import VotingSystem from "../../hardhat-tutorial/artifacts/contracts/VotingSystem.sol/VotingSystem.json";

interface Vote {
  id: number;
  name: string;
  startTime?: number;
  duration?: number;
  isOpen?: boolean;
  options?: { name: string; count: number }[];
}

const ResultsComponent: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status, account } = useMetaMask();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    async function fetchVotes() {
      try {
        if (status === "connected" && account) {
          console.log('Fetching votes for user:', account);
          const docRef = doc(db, 'usersVotes', account.toLowerCase());
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userVotes = docSnap.data().votes as { voteID: number; voteName: string }[];
            const votesData = userVotes.map(vote => ({
              id: vote.voteID,
              name: vote.voteName
            }));
            console.log('User votes:', votesData);
            setVotes(votesData);
            return votesData; // Return votesData to be used in fetchVoteDetails
          } else {
            throw new Error('No votes found for this user.');
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Failed to fetch votes:', error.message);
          setError(error.message);
        } else {
          console.error('An unexpected error occurred');
          setError('An unexpected error occurred');
        }
      }
      return [];
    }

    async function fetchVoteDetails(contractInstance: ethers.Contract, voteID: number) {
      try {
        console.log(`Fetching details for vote ${voteID}...`);
        const voteDetails = await contractInstance.getVote(voteID);
        const options = await Promise.all(
          [...Array(Number(voteDetails.optionsCount)).keys()].map(async (index) => {
            const [optionName, countOption] = await contractInstance.getOptionDetails(voteID, index);
            return { name: optionName, count: Number(countOption) };
          })
        );
        console.log(`Details for vote ${voteID}:`, voteDetails, options);
        return {
          startTime: Number(voteDetails.startVoteTime), // Convert BigInt to Number
          duration: Number(voteDetails.duration), // Convert BigInt to Number
          isOpen: voteDetails.open,
          options,
        };
      } catch (error) {
        console.error(`Failed to fetch details for vote ${voteID}:`, error);
        return null;
      }
    }

    async function fetchData() {
      try {
        if (status === "connected" && account) {
          console.log('Fetching contract details...');
          const docRef = doc(db, 'voteManagers', account.toLowerCase());
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            throw new Error('No contract information available!');
          }

          const { contractAddress } = docSnap.data();
          const abi = VotingSystem.abi;
          if (window.ethereum) {
            const contractInstance = await createContract(window.ethereum, contractAddress, abi);
            setContract(contractInstance);

            const userVotes = await fetchVotes();

            const updatedVotes = await Promise.all(
              userVotes.map(async vote => {
                const details = await fetchVoteDetails(contractInstance, vote.id);
                return details ? { ...vote, ...details } : vote;
              })
            );
            console.log('Updated votes with details:', updatedVotes);
            setVotes(updatedVotes);
          } else {
            throw new Error('Ethereum object is not available.');
          }
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Failed to load contract or votes:', error.message);
          setError(error.message);
        } else {
          console.error('An unexpected error occurred');
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [status, account]);

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
          <Typography>Loading votes...</Typography>
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
    <Container maxWidth="lg">
      <Box mt={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          User Votes
        </Typography>
        <Box>
          {votes.map(vote => (
            <Paper key={vote.id} elevation={3} style={{ margin: '10px 0', padding: '10px' }}>
              <Typography variant="h6">Vote ID: {vote.id}</Typography>
              <Typography variant="body1">Vote Name: {vote.name}</Typography>
              {vote.startTime !== undefined && (
                <Typography variant="body2">Start Time: {new Date(vote.startTime * 1000).toLocaleString()}</Typography>
              )}
              {vote.duration !== undefined && (
                <Typography variant="body2">Duration: {vote.duration} seconds</Typography>
              )}
              {vote.isOpen !== undefined && (
                <Typography variant="body2">Status: {vote.isOpen ? 'Open' : 'Closed'}</Typography>
              )}
              {vote.options && (
                <Box mt={2}>
                  <Typography variant="body2" component="div">Options:</Typography>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Option Name</TableCell>
                          <TableCell>Vote Count</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {vote.options.map((option, index) => (
                          <TableRow key={`${vote.id}-${index}`}>
                            <TableCell>{option.name}</TableCell>
                            <TableCell>{option.count}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      </Box>
    </Container>
  );
};

export default ResultsComponent;
