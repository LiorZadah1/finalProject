import React, { useState, useEffect } from 'react';
import { useMetaMask } from "metamask-react";
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Box,
  Card,
  CardContent
} from '@mui/material';

interface Vote {
  voteID: string;
  voteName: string;
}

const UserVotes: React.FC = () => {
  const { status, account } = useMetaMask();
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        if (status === "connected" && account) {
          const docRef = doc(db, 'usersVotes', account);
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            throw new Error('No user votes information available!');
          }
          const userVotes = docSnap.data().votes;
          console.log("User Votes from Firestore: ", userVotes);
          
          const formattedVotes = userVotes.map((vote: any) => ({
            voteID: vote.voteID.toString(),
            voteName: vote.voteName,
          }));
          setVotes(formattedVotes);
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Failed to load user votes:', error.message);
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
          <Typography>Loading user votes...</Typography>
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
      <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: 'rgba(255, 255, 255, 0.7)' }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
            Votes Created By Me
          </Typography>
          {votes.length > 0 ? (
            <TableContainer component={Paper} style={{ marginTop: '20px' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Vote ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', color: '#1976d2' }}>Vote Name</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {votes.map((vote) => (
                    <TableRow key={vote.voteID}>
                      <TableCell>{vote.voteID}</TableCell>
                      <TableCell>{vote.voteName}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" component="p">
              No votes created yet.
            </Typography>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserVotes;
