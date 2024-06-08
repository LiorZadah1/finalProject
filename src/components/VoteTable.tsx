import React, { useState, useEffect } from 'react';
import { useMetaMask } from "metamask-react";
import { ethers } from 'ethers';
import { createContract } from '../utils/createContract';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
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
          console.log("MetaMask status:", status);
          console.log("Account:", account);
          console.log("Ethereum object:", ethereum);
          const docRef = doc(db, 'contracts', account);
          console.log("Document Reference:", docRef.path);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (ethereum) {
              const contractInstance = await createContract(ethereum, data.address, data.abi);
              setContract(contractInstance);
              console.log(account);
              console.log(account);
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
          const voteData = await contract.getAccessibleVotes(account);
          const formattedVotes = voteData.map((vote: any) => ({
            id: vote.id.toString(),
            name: vote.name,
            startDate: new Date(vote.startDate * 1000).toISOString(),
            endDate: new Date(vote.endDate * 1000).toISOString(),
            status: vote.open,
          }));
          setVotes(formattedVotes);
        } catch (error) {
          console.error('Error fetching votes:', error);
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
          No votes available or loading data...
        </Typography>
      )}
    </Container>
  );
};

export default VoteTable;
