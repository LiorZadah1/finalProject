import React, { useState, useEffect } from 'react';
import { useMetaMask } from "metamask-react";
import { ethers } from 'ethers';
import { createContract } from '../utils/createContract';
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
import { getGroupIdForUser } from '../utils/getGroupIdForUser';

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
          const docRef = doc(db, 'voteManagers', account.toLowerCase());
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const abi = VotingSystem.abi;
            const { contractAddress } = docSnap.data();
            if (ethereum) {
              const contractInstance = await createContract(ethereum, contractAddress, abi);
              setContract(contractInstance);
              console.log("Contract instance created successfully:", contractInstance);
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

  useEffect(() => {
    const fetchVotes = async () => {
      if (contract && account) {
        try {
          const groupId = await getGroupIdForUser(account.toLowerCase());
          if (groupId === null) throw new Error("Group ID not found for the user");

          const result = await contract.getAccessibleVotes(groupId);
          console.log('Result from contract:', result);

          const [voteIDs, voteNames, startVoteTimes, durations, openStatuses] = result;

          const formattedVotes = voteIDs.map((voteID: ethers.BigNumberish, index: number) => {
            const startDate = new Date(Number(startVoteTimes[index]) * 1000);
            const endDate = new Date((Number(startVoteTimes[index]) + Number(durations[index])) * 1000);
            const isVoteOpen = endDate > new Date();

            const dateFormatter = new Intl.DateTimeFormat('en-GB', {
              hour: '2-digit',
              minute: '2-digit',
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            });

            return {
              id: voteID.toString(),
              name: voteNames[index],
              startDate: dateFormatter.format(startDate),
              endDate: dateFormatter.format(endDate),
              status: isVoteOpen,
            };
          });

          setVotes(formattedVotes);
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error('Error fetching votes:', error.message);
            setError(error.message);
          } else {
            console.error('An unexpected error occurred');
            setError('An unexpected error occurred');
          }
        }
      }
    };

    fetchVotes();
  }, [contract, account]);

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
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Start Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>End Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Action</TableCell>
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
                    <Button 
                      variant="contained" 
                      color="primary" 
                      onClick={() => navigate(`/voting-component/:${vote.id}`)}
                      disabled={!vote.status}
                    >
                      Go to Vote
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Typography variant="body1" component="p">
          No votes available yet :)
        </Typography>
      )}
    </Container>
  );
};

export default VoteTable;
