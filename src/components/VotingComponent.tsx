import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useMetaMask } from "metamask-react";
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { createContract } from '../utils/createContract';
import VotingSystem from "../../hardhat-tutorial/artifacts/contracts/VotingSystem.sol/VotingSystem.json";
import { useParams, useNavigate } from 'react-router-dom';
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
  Card,
  CardContent
} from '@mui/material';
import useCheckUser from '../utils/checkUser';
import useFetchUserDetails from '../hooks/useFetchUserDetails';

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
  const [isValidUser, userLoading] = useCheckUser();
  const [userDetails, userDetailsLoading, userDetailsError] = useFetchUserDetails(account || '');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContractDetails = async () => {
      if (status === "connected" && account && !userLoading && !userDetailsLoading) {
        try {
          let contractAddress: string | null = null;

          if (isValidUser) {
            const docRef = doc(db, 'voteManagers', account.toLowerCase());
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              contractAddress = docSnap.data().contractAddress;
            }
          } else if (userDetails) {
            contractAddress = userDetails.contractAddress;
          }

          if (contractAddress && window.ethereum) {
            const abi = VotingSystem.abi;
            const contractInstance = await createContract(window.ethereum, contractAddress, abi);
            setContract(contractInstance);
            console.log("Contract instance created successfully:", contractInstance);
          } else {
            throw new Error("Contract details not found!");
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
    };

    if (!userLoading && !userDetailsLoading) {
      fetchContractDetails();
    }
  }, [status, account, isValidUser, userLoading, userDetails, userDetailsLoading]);

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
      alert("Please check your MetaMask extension :)")
      let cleanedVoteID = voteID;
      if (voteID.startsWith(':')) {
        cleanedVoteID = voteID.substring(1);
      }
      const voteIdBigInt = BigInt(cleanedVoteID); // Convert voteID to BigInt

      console.log(`Casting vote for voteID: ${voteIdBigInt} with option index: ${selectedOptionIndex}`);

      // Get the estimated gas price
      const provider = new ethers.BrowserProvider(window.ethereum);
      const gasPrice = (await provider.getFeeData()).gasPrice;

      // Estimate gas for the specific transaction
      const estimatedGas = await contract.castVote.estimateGas(voteIdBigInt, BigInt(selectedOptionIndex));

      // Send the transaction with the estimated gas and gas price
      const tx = await contract.castVote(voteIdBigInt, BigInt(selectedOptionIndex), {
        gasLimit: estimatedGas,
        gasPrice: gasPrice,
      });

      await tx.wait();
      alert('Vote successfully cast!');
      navigate('/vote-results'); // Redirect to results component
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

  if (isLoading || userLoading || userDetailsLoading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress />
          <Typography>Loading vote data...</Typography>
        </Box>
      </Container>
    );
  }

  if (error || userDetailsError) {
    return (
      <Container>
        <Typography color="error">{error || userDetailsError}</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box mt={4}>
        <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: 'rgba(173, 216, 230, 0.7)' }}>
          <CardContent>
            <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
              Cast your vote
            </Typography>
            {vote && (
              <>
                <Typography variant="h5" component="h2" gutterBottom>
                  Vote name: {vote.name}
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
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default VotingComponent;
