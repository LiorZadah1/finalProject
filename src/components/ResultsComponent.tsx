import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createContract } from '../utils/createContract';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useMetaMask } from "metamask-react";
import { Container,Typography,Table,TableBody,TableCell,TableContainer,TableHead,
          TableRow,Paper,CircularProgress } from '@mui/material';

interface Option {
  optionName: string;
  voteCount: number;
}
// Need to understand what we need to fetch here
const ResultsComponent: React.FC = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status, account } = useMetaMask();  
  useEffect(() => {
    async function fetchData() {
      try {
        if (status === "connected") {
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
          await fetchResults(contractInstance);
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

    async function fetchResults(contract: ethers.Contract) {
      const voteID = 1; // Example vote ID, this should be dynamically determined based on the context
      const optionsCount = await contract.getOptionsCount(voteID);
      const voteCounts: number[] = await contract.getVoteResults(voteID, optionsCount);

      // Use Array.from and Promise.all to fetch options in parallel
      const optionsArray: Option[] = await Promise.all(
        Array.from({ length: optionsCount }).map(async (_, i) => {
          const optionDetails = await contract.getOptionDetails(voteID, i);
          return {
            optionName: optionDetails.optionName,
            voteCount: voteCounts[i],
          };
        })
      );

      setOptions(optionsArray);
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography>Loading results...</Typography>
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
        Vote Results
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Option Name</TableCell>
              <TableCell>Vote Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {options.map((option, index) => (
              <TableRow key={index}>
                <TableCell>{option.optionName}</TableCell>
                <TableCell>{option.voteCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ResultsComponent;
