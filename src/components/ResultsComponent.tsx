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
  TableRow,
  Grid,
  IconButton,
  Collapse,
  Card,
  CardContent,
  CardActions,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
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
  timeLeft?: string;
  endTime?: number;
}

const ResultsComponent: React.FC = () => {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status, account } = useMetaMask();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  const formatDuration = (seconds: number): string => {
    const units = [
      { label: 'day', value: 86400 },
      { label: 'hour', value: 3600 },
      { label: 'minute', value: 60 },
      { label: 'second', value: 1 },
    ];

    for (const unit of units) {
      const quotient = Math.floor(seconds / unit.value);
      if (quotient > 0) {
        return quotient === 1 ? `1 ${unit.label}` : `${quotient} ${unit.label}s`;
      }
    }

    return '0 seconds';
  };

  const calculateTimeLeft = (startTime: number, duration: number): string => {
    const currentTime = Math.floor(Date.now() / 1000);
    const endTime = startTime + duration;
    const timeLeft = endTime - currentTime;

    if (timeLeft <= 0) {
      return 'Vote ended';
    }

    return formatDuration(timeLeft);
  };

  const formatDateTime = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

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

        const startTime = Number(voteDetails.startVoteTime);
        const duration = Number(voteDetails.duration);
        const isOpen = voteDetails.open && (Date.now() / 1000 < startTime + duration);
        const timeLeft = calculateTimeLeft(startTime, duration);
        const endTime = startTime + duration; // Calculate the end time

        return {
          startTime,
          duration,
          isOpen,
          options,
          timeLeft,
          endTime, // Add endTime to the returned details
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

  const openVotes = votes.filter(vote => vote.isOpen);
  const closedVotes = votes.filter(vote => !vote.isOpen);

  return (
    <Container maxWidth="lg">
      <Box mt={4}>
        <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Votes Result
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: 'rgba(173, 216, 230, 0.7)' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#000' }}>
                  Open Votes
                </Typography>
                <Divider sx={{ mb: 2, backgroundColor: '#000' }} />
                <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Vote Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Start Time</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Duration</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Time Left</TableCell>
                        <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Total Votes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {openVotes.map(vote => (
                        <TableRow key={vote.id}>
                          <TableCell>{vote.name}</TableCell>
                          {vote.startTime !== undefined && (
                            <TableCell>{formatDateTime(vote.startTime)}</TableCell>
                          )}
                          {vote.duration !== undefined && (
                            <TableCell>{formatDuration(vote.duration)}</TableCell>
                          )}
                          {vote.timeLeft && (
                            <TableCell>{vote.timeLeft}</TableCell>
                          )}
                          <TableCell>
                            {vote.options?.reduce((total, option) => total + option.count, 0)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: 'rgba(173, 216, 230, 0.7)' }}>
              <CardContent>
                <Typography variant="h5" component="h2" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#000' }}>
                  Closed Votes
                </Typography>
                <Divider sx={{ mb: 2, backgroundColor: '#000' }} />
                {closedVotes.map(vote => (
                  <Paper key={vote.id} elevation={3} style={{ margin: '10px 0', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
                    <Typography variant="h6" sx={{ color: '#1976d2' }}>Vote ID: {vote.id}</Typography>
                    <Typography variant="body1" sx={{ color: '#555' }}>Vote Name: {vote.name}</Typography>
                    {vote.endTime !== undefined && (
                      <Typography variant="body2" sx={{ color: '#777' }}>End Time: {formatDateTime(vote.endTime)}</Typography>
                    )}
                    {vote.options && (
                      <Box mt={2}>
                        <Typography variant="body2" component="div" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                          Selected Option: {vote.options.sort((a, b) => b.count - a.count)[0].name}
                        </Typography>
                        <DropdownOptions options={vote.options} voteId={vote.id} />
                      </Box>
                    )}
                  </Paper>
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

interface DropdownOptionsProps {
  options: { name: string; count: number }[];
  voteId: number;
}

const DropdownOptions: React.FC<DropdownOptionsProps> = ({ options, voteId }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <CardActions>
        <IconButton onClick={() => setOpen(!open)} sx={{ color: '#1976d2' }}>
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </CardActions>
      <Collapse in={open}>
        <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Option Name</TableCell>
                <TableCell>Vote Count</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {options
                .sort((a, b) => b.count - a.count)
                .map((option, index) => (
                  <TableRow key={`${voteId}-${index}`}>
                    <TableCell>{option.name}</TableCell>
                    <TableCell>{option.count}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </>
  );
};

export default ResultsComponent;
