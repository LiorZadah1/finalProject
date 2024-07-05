import React from 'react';
import { Container, Typography, Grid, Box, Paper, Card, CardContent } from '@mui/material';
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
        <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
          Voting Management
        </Typography>
        <Grid container spacing={3}>
          {isValidUser && !userLoading && (
            <>
              <Grid item xs={12} sm={6}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: 'rgba(173, 216, 230, 0.7)' }}>
                  <CardContent>
                    <AddVoterAddress />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: 'rgba(173, 216, 230, 0.7)' }}>
                  <CardContent>
                    <UserVotes />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: 'rgba(173, 216, 230, 0.7)' }}>
                  <CardContent>
                    <UserGroupAddresses />
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6}>
            <Card sx={{ borderRadius: 3, boxShadow: 3, backgroundColor: 'rgba(173, 216, 230, 0.7)' }}>
              <CardContent>
                <ParticipatedVotes />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default ManagementComponent;
