import React, { useState, useEffect } from 'react';
import { useMetaMask } from "metamask-react";
import { ethers } from 'ethers';
import { createContract } from '../utils/createContract';
import { getGroupIdForUser } from '../utils/getGroupIdForUser';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import VotingSystem from "../../hardhat-tutorial/artifacts/contracts/VotingSystem.sol/VotingSystem.json";
import {
  Container,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  CircularProgress,
  Box
} from '@mui/material';

interface Vote {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: boolean;
}

const VoteTable = () => {
  const { status, account, ethereum } = useMetaMask();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContractDetails = async () => {
      if (status === "connected" && account) {
        try {
          const docRef = doc(db, 'users', account.toLowerCase());
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const abi = VotingSystem.abi;
            const { contractAddress } = docSnap.data();
            if (ethereum) {
              const contractInstance = await createContract(ethereum, contractAddress, abi);
              setContract(contractInstance);
              // Fetch votes after setting up the contract
              fetchVotes(contractInstance);
            }
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
          setLoading(false);
        }
      }
    };

    fetchContractDetails();
  }, [status, account, ethereum]);

  const fetchVotes = async (contractInstance: ethers.Contract) => {
    if (contractInstance && account) {
      try {
        const groupId = await getGroupIdForUser(account.toLowerCase());
        if (groupId !== null) {
          console.log('Group ID:', groupId);
          const result = await contractInstance.getAccessibleVotes(groupId);
  
          if (!result || !Array.isArray(result[0])) {
            console.error('Unexpected result format:', result);
            setError('Unexpected result format from contract');
            return;
          }
  
          const [voteIDs, voteNames, startVoteTimes, endVoteTimes, openStatuses] = result;
  
          console.log('Result from contract:', result);
  
          const formattedVotes = voteIDs.map((voteID: BigInt, index: number) => {
            const startDate = new Date(Number(startVoteTimes[index]) * 1000);
            const endDate = new Date(Number(endVoteTimes[index]) * 1000);
            console.log('vote:', voteID); // Log each vote
            console.log('startDate:', startDate);
            console.log('endDate:', endDate);
  
            return {
              id: voteID.toString(),
              name: voteNames[index],
              startDate: isNaN(startDate.getTime()) ? 'Invalid Date' : startDate.toISOString(),
              endDate: isNaN(endDate.getTime()) ? 'Invalid Date' : endDate.toISOString(),
              status: openStatuses[index],
            };
          });
          setVotes(formattedVotes);
        } else {
          setError('Group ID not found for the user.');
        }
      } catch (error) {
        console.error('Error fetching votes:', error);
        setError('Error fetching votes');
      }
    }
  };
  
  
  
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredVotes = votes.filter(vote =>
    vote.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Voting Table
      </Typography>
      <TextField
        label="Search votes..."
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={handleSearch}
      />
      {filteredVotes.length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredVotes.map((vote) => (
                <TableRow key={vote.id}>
                  <TableCell>{vote.name}</TableCell>
                  <TableCell>{vote.startDate}</TableCell>
                  <TableCell>{vote.endDate}</TableCell>
                  <TableCell>{vote.status ? 'Open' : 'Closed'}</TableCell>
                  <TableCell>
                    <Button variant="contained" color="primary" onClick={() => navigate(`/vote/${vote.id}`)}>
                      Vote
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" component="p">
          No votes available or loading data...
        </Typography>
      )}
    </Container>
  );
};

export default VoteTable;
