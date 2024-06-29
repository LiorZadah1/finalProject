import React from 'react';
import { Container, Typography, Grid, Box, Paper } from '@mui/material';
import UserVotes from './UserVotes';
import ParticipatedVotes from './ParticipatedVotes';
import AddVoterAddress from './AddVoterAddress';
import useCheckUser from '../utils/checkUser';

const ManagementComponent: React.FC = () => {
  const [isValidUser, userLoading] = useCheckUser();

  return (
    <Container maxWidth="lg">
      <Box mt={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Voting Management
        </Typography>
        <Grid container spacing={4}>
          {isValidUser && !userLoading && (
            <>
              <Grid item xs={12}>
                <Paper elevation={3}>
                  <Box p={2}>
                    {/* <Typography variant="h5" component="h2" gutterBottom>
                      Add Voter Address
                    </Typography> */}
                    <AddVoterAddress />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={3}>
                  <Box p={2}>
                    {/* <Typography variant="h5" component="h2" gutterBottom>
                      Votes Created By Me
                    </Typography> */}
                    <UserVotes />
                  </Box>
                </Paper>
              </Grid>
            </>
          )}
          <Grid item xs={12} md={6}>
            <Paper elevation={3}>
              <Box p={2}>
                {/* <Typography variant="h5" component="h2" gutterBottom>
                  Votes I've Participated In
                </Typography> */}
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
