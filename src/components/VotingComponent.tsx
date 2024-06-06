import React, { useState, useEffect } from 'react';
import { createContract } from '../utils/createContract';
import { db } from '../firebaseConfig'; // Import Firestore configuration
import { doc, getDoc } from 'firebase/firestore';
import { ethers } from 'ethers';
import { useMetaMask } from "metamask-react";
import {
  Container,
  Typography,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Button,
  CircularProgress,
  Box,
  Paper
} from '@mui/material';

// Define the structure of an option as expected from the smart contract.
interface Option {
  optionName: string;
  countOption: number;
}

const VotingProcess: React.FC = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status, account } = useMetaMask();

  useEffect(() => {
    async function setupContract() {
      try {
        if (status === "connected" && account) {
          const docRef = doc(db, 'contracts', account);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            throw new Error('No contract information available!');
          }

          const { abi, address } = docSnap.data();
          if (!abi || !address) {
            throw new Error('Contract ABI or address is missing.');
          }

          const contractInstance = await createContract(window.ethereum, address, abi);
          setContract(contractInstance);
          await fetchOptions(contractInstance);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error setting up the contract:', error.message);
          setError(error.message);
        } else {
          console.error('An unexpected error occurred');
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    }

    async function fetchOptions(contract: ethers.Contract) {
      const voteID = 1; // Example vote ID, dynamically determine this as needed
      const optionsCount = await contract.getOptionsCount(voteID);

      const fetchPromises = Array.from({ length: optionsCount }, async (_, index) => {
        const option = await contract.getOptionDetails(voteID, index);
        return {
          optionName: option.optionName,
          countOption: option.countOption
        };
      });

      const optionsArray: Option[] = await Promise.all(fetchPromises);
      setOptions(optionsArray);
    }

    setupContract();
  }, [status, account]);

  const handleVote = async () => {
    if (selectedOption === null || !contract) return;
    setIsSubmitting(true);

    try {
      await contract.castVote(1, selectedOption);
      setVoteSubmitted(true);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
          <Typography>Loading contract data...</Typography>
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

  if (voteSubmitted) {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Thank you for voting!
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Vote on an Option
      </Typography>
      <Paper elevation={3} style={{ padding: '20px', marginTop: '20px' }}>
        <FormControl component="fieldset">
          <RadioGroup
            value={selectedOption?.toString() || ''}
            onChange={(e) => setSelectedOption(parseInt(e.target.value))}
          >
            {options.map((option, index) => (
              <FormControlLabel
                key={index}
                value={index.toString()}
                control={<Radio disabled={isSubmitting} />}
                label={`${option.optionName} (Votes: ${option.countOption})`}
              />
            ))}
          </RadioGroup>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleVote}
          disabled={isSubmitting || selectedOption === null}
          style={{ marginTop: '20px' }}
        >
          Submit Vote
        </Button>
      </Paper>
    </Container>
  );
};

export default VotingProcess;
