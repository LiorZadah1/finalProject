import React from 'react';
import { Container, Typography, Button, Grid, Card, CardContent, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  status: string;
  account: string | null;
  connect: () => Promise<void>; // Adjust the type to match the wrapped function
}

const HomePage: React.FC<HomePageProps> = ({ status, account, connect }) => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" style={{ marginTop: '2rem', textAlign: 'center' }}>
      <Typography variant="h3" component="h1" gutterBottom >
        Welcome to the Voting System
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Secure, Transparent, and Decentralized Voting
      </Typography>

      {status === "notConnected" && (
        <Button variant="contained" color="primary" onClick={connect}>
          Connect to MetaMask
        </Button>
      )}

      {status === "connected" && (
        <Typography variant="body1" component="p">
          Connected account: {account}
        </Typography>
      )}

      <Box display="flex" justifyContent="center">
        <Grid container spacing={4} justifyContent="center" style={{ marginTop: '20px' }}>
          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" component="h2">
                  Vote Now
                </Typography>
                <Typography variant="body2" component="p">
                  Participate in ongoing votes.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/voting-component')}>
                  Go to Voting
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" component="h2">
                  Create Election
                </Typography>
                <Typography variant="body2" component="p">
                  Set up a new vote.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/election-form')}>
                  Create Election
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" component="h2">
                  View Results
                </Typography>
                <Typography variant="body2" component="p">
                  Check the vote results.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/vote-results')}>
                  View Results
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <CardContent style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography variant="h5" component="h2">
                  User Management
                </Typography>
                <Typography variant="body2" component="p">
                  Manage your voting activities.
                </Typography>
                <Button variant="contained" color="primary" onClick={() => navigate('/user-management')}>
                  Manage User
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
