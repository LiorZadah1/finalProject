import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useMetaMask } from "metamask-react";
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { createContract } from '../utils/createContract';
import VotingSystem from "../../hardhat-tutorial/artifacts/contracts/VotingSystem.sol/VotingSystem.json";
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  CircularProgress,
  Box,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

interface Vote {
  id: string;
  name: string;
  options: string[];
  startDate: string;
  endDate: string;
  status: boolean;
}

const VotingComponent: React.FC = () => {
  const { voteID } = useParams<{ voteID: string }>();
  const { status, account } = useMetaMask();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [vote, setVote] = useState<Vote | null>(null);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (status === "connected" && account) {
          const docRef = doc(db, 'users', account.toLowerCase());
          const docSnap = await getDoc(docRef);
          if (!docSnap.exists()) {
            throw new Error('No contract information available!');
          }
          const { contractAddress } = docSnap.data();
          const abi = VotingSystem.abi;
          if (window.ethereum) {
            const contractInstance = await createContract(window.ethereum, contractAddress, abi);
            setContract(contractInstance);
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
    };

    fetchData();
  }, [status, account]);

  useEffect(() => {
    const fetchVote = async () => {
      if (contract && voteID) {
        try {
          console.log(`Raw voteID: ${voteID}`);
          
          let cleanedVoteID = voteID;
          if (voteID.startsWith(':')) {
            cleanedVoteID = voteID.substring(1);
          }

          const voteIdBigInt = BigInt(cleanedVoteID); // Convert voteID to BigInt
          console.log(`Converted voteID to BigInt: ${voteIdBigInt}`);
          const voteData = await contract.getVote(voteIdBigInt);
          console.log('Vote data:', voteData);

          const options: string[] = [];
          for (let i = 0; i < voteData[4]; i++) { // voteData[4] should be optionsCount
            const option = await contract.getOptionDetails(voteIdBigInt, i);
            console.log(`Option ${i} details:`, option);
            options.push(option[0]); // option[0] should be optionName
          }

          setVote({
            id: cleanedVoteID,
            name: voteData[0], // voteName
            options: options,
            startDate: new Date(Number(voteData[1]) * 1000).toISOString(), // startVoteTime
            endDate: new Date((Number(voteData[1]) + Number(voteData[2])) * 1000).toISOString(), // startVoteTime + duration
            status: voteData[3], // open
          });
        } catch (error) {
          console.error('Error fetching vote:', error);
          setError('Failed to fetch vote details.');
        }
      }
    };

    fetchVote();
  }, [contract, voteID]);

  const handleVote = async () => {
    if (!contract) {
      setError('Contract is not loaded.');
      return;
    }

    if (selectedOptionIndex === null) {
      setError('Please select an option.');
      return;
    }

    try {
      if (!voteID) {
        throw new Error('Vote ID is not defined.');
      }
      let cleanedVoteID = voteID;
      if (voteID.startsWith(':')) {
        cleanedVoteID = voteID.substring(1);
      }
      const voteIdBigInt = BigInt(cleanedVoteID); // Convert voteID to BigInt

      console.log(`Casting vote for voteID: ${voteIdBigInt} with option index: ${selectedOptionIndex}`);
      const tx = await contract.castVote(voteIdBigInt, BigInt(selectedOptionIndex));
      await tx.wait();
      alert('Vote successfully cast!');
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Failed to cast vote:', error.message);
        setError(error.message);
      } else {
        console.error('An unexpected error occurred');
        setError('An unexpected error occurred');
      }
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
          <Typography>Loading vote data...</Typography>
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
    <Container maxWidth="sm">
      <Box mt={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Cast Your Vote
        </Typography>
        {vote && (
          <>
            <Typography variant="h5" component="h2" gutterBottom>
              {vote.name}
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="select-option-label">Select Option</InputLabel>
              <Select
                labelId="select-option-label"
                value={selectedOptionIndex !== null ? selectedOptionIndex.toString() : ''}
                onChange={(e) => setSelectedOptionIndex(Number(e.target.value))}
              >
                {vote.options.map((option, index) => (
                  <MenuItem key={index} value={index}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {error && (
              <Typography color="error" gutterBottom>
                {error}
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleVote}
              disabled={selectedOptionIndex === null}
            >
              Submit Vote
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default VotingComponent;
