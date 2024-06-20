import React from 'react';
import { Container, Typography, Button, Grid, Card, CardContent, CardActions, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface HomePageProps {
  status: string;
  account: string | null;
  connect: () => Promise<void>; // Adjust the type to match the wrapped function
}

const HomePage: React.FC<HomePageProps> = ({ status, account, connect }) => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" style={{ marginTop: '40px' }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" component="h1" gutterBottom>
          Welcome to the Voting System
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Secure, Transparent, and Decentralized Voting
        </Typography>

        {status === "notConnected" && (
          <Button variant="contained" color="primary" onClick={connect} size="large" style={{ marginTop: '20px' }}>
            Connect to MetaMask
          </Button>
        )}

        {status === "connected" && (
          <Typography variant="body1" component="p" style={{ marginTop: '20px' }}>
            Connected account: <strong>{account}</strong>
          </Typography>
        )}
      </Box>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                Vote Now
              </Typography>
              <Typography variant="body2" component="p" color="textSecondary">
                Participate in ongoing votes.
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/voting-component')}>
                Go to Voting
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                Create Election
              </Typography>
              <Typography variant="body2" component="p" color="textSecondary">
                Set up a new vote.
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/election-form')}>
                Create Election
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                View Results
              </Typography>
              <Typography variant="body2" component="p" color="textSecondary">
                Check the results of completed votes.
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/vote-results')}>
                View Results
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h5" component="h2">
                User Management
              </Typography>
              <Typography variant="body2" component="p" color="textSecondary">
                Manage your voting activities.
              </Typography>
            </CardContent>
            <CardActions>
              <Button variant="contained" color="primary" fullWidth onClick={() => navigate('/user-management')}>
                Manage User
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;
