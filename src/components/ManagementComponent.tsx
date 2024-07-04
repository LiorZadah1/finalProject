import React from 'react';
import { Container, Typography, Grid, Box, Paper } from '@mui/material';
import UserVotes from './UserVotes';
import ParticipatedVotes from './ParticipatedVotes';
import AddVoterAddress from './AddVoterAddress';
import useCheckUser from '../utils/checkUser';
import UserGroupAddresses from './UserGroupAddresses';

const ManagementComponent: React.FC = () => {
  const [isValidUser, userLoading] = useCheckUser();

  return (
    <Container maxWidth="lg">
      <Box mt={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Voting Management
        </Typography>
        <Grid container spacing={3}>
          {isValidUser && !userLoading && (
            <>
              <Grid item xs={12} sm={6}>
                <Paper elevation={3}>
                  <Box p={2}>
                    <AddVoterAddress />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={3}>
                  <Box p={2}>
                    <UserVotes />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Paper elevation={3}>
                  <Box p={2}>
                    <UserGroupAddresses />
                  </Box>
                </Paper>
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6}>
            <Paper elevation={3}>
              <Box p={2}>
                <ParticipatedVotes />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ManagementComponent;
