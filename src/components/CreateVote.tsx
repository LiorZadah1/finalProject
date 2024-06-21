import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createContract } from '../utils/createContract';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useMetaMask } from "metamask-react";
import VotingSystem from "../../hardhat-tutorial/artifacts/contracts/VotingSystem.sol/VotingSystem.json";
import { getCurrentVoteId, fetchAndUpdateVoteId } from '../utils/fetchAndUpdateVoteId';
import {
  Container,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Grid,
  Box,
} from '@mui/material';

const CreateVote: React.FC = () => {
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [voteName, setVoteName] = useState('');
  const [startVoteTime, setStartVoteTime] = useState('');
  const [voteDuration, setVoteDuration] = useState('');
  const [groupId, setGroupId] = useState('');
  const [voteOptions, setVoteOptions] = useState(['']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voteId, setVoteId] = useState<number | null>(null); // State for vote ID
  const { status, account } = useMetaMask();

  useEffect(() => {
    async function fetchData() {
      try {
        if (status === "connected" && account) {
          const docRef = doc(db, 'users', account.toLowerCase()); // Ensure account is lowercase
          const docSnap = await getDoc(docRef);
          
          if (!docSnap.exists()) {
            throw new Error('No contract information available!');
          }

          const { contractAddress } = docSnap.data();
          const abi = VotingSystem.abi;
          if (window.ethereum) {
            const contractInstance = await createContract(window.ethereum, contractAddress, abi);
            setContract(contractInstance);

            // Fetch the current vote ID
            const currentVoteId = await getCurrentVoteId();
            setVoteId(currentVoteId);
          } else {
            throw new Error('Ethereum object is not available.');
          }
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
        setIsLoading(false);
      }
    }

    fetchData();
  }, [status, account]);

  if (isLoading) {
    return (
      <Container>
        <CircularProgress />
        <Typography>Loading contract data...</Typography>
      </Container>
    );
  }

  if (!contract) {
    return (
      <Container>
        <Typography color="error">{error || 'Contract is not loaded.'}</Typography>
      </Container>
    );
  }

  const handleOptionChange = (index: number, value: string) => {
    const options = [...voteOptions];
    options[index] = value;
    setVoteOptions(options);
  };

  const addOption = () => {
    if (voteOptions.length < 10) {
      setVoteOptions([...voteOptions, '']);
    } else {
      setError('A maximum of 10 options are allowed.');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const startTime = BigInt(Date.parse(startVoteTime) / 1000);
      const duration = BigInt(voteDuration) * 24n * 60n * 60n; // Convert days to seconds
      const groupID = BigInt(groupId);
      const options = voteOptions.filter(option => option.trim() !== '');
      if (duration <= 0) throw new Error('Duration must be a positive number.');

      // Increment and fetch the next vote ID
      const voteID = await fetchAndUpdateVoteId();
      setVoteId(voteID);

      const tx = await contract.createVote(voteID, voteName, startTime, duration, groupID, options);
      await tx.wait();
      alert(`Vote successfully created with ID: ${voteID}`);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to create vote:', error.message);
        setError(error.message);
      } else {
        console.error('An unexpected error occurred');
        setError('An unexpected error occurred');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Create New Vote
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom>
          {`Vote Identifier - ${voteId}`}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="Vote Name"
                variant="outlined"
                fullWidth
                value={voteName}
                onChange={(e) => setVoteName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Start Vote Time"
                type="datetime-local"
                variant="outlined"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={startVoteTime}
                onChange={(e) => setStartVoteTime(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Vote Duration (days)"
                type="number"
                variant="outlined"
                fullWidth
                value={voteDuration}
                onChange={(e) => setVoteDuration(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Group ID"
                type="number"
                variant="outlined"
                fullWidth
                value={groupId}
                onChange={(e) => setGroupId(e.target.value)}
              />
            </Grid>
            {voteOptions.map((option, index) => (
              <Grid item xs={12} key={index}>
                <TextField
                  label={`Option ${index + 1}`}
                  variant="outlined"
                  fullWidth
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                />
              </Grid>
            ))}
            {voteOptions.length < 10 && (
              <Grid item xs={12}>
                <Button onClick={addOption} variant="contained" fullWidth>
                  Add Option
                </Button>
              </Grid>
            )}
            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary" fullWidth>
                Create Vote
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </Container>
  );
};

export default CreateVote;
