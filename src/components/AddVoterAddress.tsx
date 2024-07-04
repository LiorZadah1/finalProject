import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Container, TextField, Button, Typography, Box, Grid } from '@mui/material';
import { useMetaMask } from "metamask-react";
import useCheckUser from '../utils/checkUser';

const AddVoteAddress: React.FC = () => {
  const { account } = useMetaMask();
  const [groupId, setGroupId] = useState('');
  const [voterAddress, setVoterAddress] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValidUser, userLoading] = useCheckUser();

  const resetForm = () => {
    setGroupId('');
    setVoterAddress('');
  };
  const handleAddVoter = async () => {
    if (!groupId || !voterAddress) {
      setError('Group ID and Voter Address are required');
      return;
    }
    try {
      const userRef = doc(db, 'voteManagers', account as string);
      await updateDoc(userRef, {
        [`group.${groupId}`]: arrayUnion(voterAddress)
      });
      setMessage('Voter address added successfully');
      resetForm();
      setError(null);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
      setMessage(null);
    }
  };

  if (userLoading) {
    return <Typography>Loading...</Typography>;
  }

  if (!isValidUser) {
    return <Typography color="error">You are not authorized to add voter addresses.</Typography>;
  }

  return (
    <Container maxWidth="sm">
      <Box mt={1}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add Voter Address
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              label="Group ID"
              variant="outlined"
              fullWidth
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Voter Address"
              variant="outlined"
              fullWidth
              value={voterAddress}
              onChange={(e) => setVoterAddress(e.target.value)}
            />
          </Grid>
          {error && (
            <Grid item xs={12}>
              <Typography color="error">{error}</Typography>
            </Grid>
          )}
          {message && (
            <Grid item xs={12}>
              <Typography color="primary">{message}</Typography>
            </Grid>
          )}
          <Grid item xs={12}>
            <Button onClick={handleAddVoter} variant="contained" color="primary" fullWidth>
              Add Voter
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default AddVoteAddress;
