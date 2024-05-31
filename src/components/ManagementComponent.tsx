import React from 'react';
import { Container, Typography, Grid } from '@mui/material';
import UserVotes from './UserVotes';
import ParticipatedVotes from './ParticipatedVotes';

const ManagementComponent: React.FC = () => {
  return (
    <Container>
      <Typography variant="h3" component="h1" gutterBottom>
        Voting Management
      </Typography>
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <UserVotes />
        </Grid>
        <Grid item xs={12} md={6}>
          <ParticipatedVotes />
        </Grid>
      </Grid>
    </Container>
  );
};

export default ManagementComponent;
