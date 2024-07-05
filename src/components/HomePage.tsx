import React from 'react';
import { Container, Typography, Grid, Card, CardContent, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import useCheckUser from '../utils/checkUser';

interface HomePageProps {
  status: string;
  account: string | null;
  connect: () => Promise<void>; // Adjust the type to match the wrapped function
}

const HomePage: React.FC<HomePageProps> = ({ status, account, connect }) => {
  const navigate = useNavigate();
  const [isValidUser, userLoading] = useCheckUser();

  return (
    <Container maxWidth="md" sx={{ marginTop: '2rem', paddingLeft: '20px', paddingRight: '20px', textAlign: 'center' }}>
      <Typography variant="h2" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
        Welcome to the Voting System
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom>
        We are using Block-chain to ensure
      </Typography>
      <Typography variant="h5" component="h2" gutterBottom>
        Secure, Transparent, and Decentralized Voting
      </Typography>

      {status === "connected" && (
        <Typography variant="body1" component="p">
          Connected account: {account}
        </Typography>
      )}

      <Box display="flex" justifyContent="center">
        <Grid container spacing={4} justifyContent="center" sx={{ marginTop: '20px' }}>
          <Grid item xs={12} sm={6} md={6}>
            <Box onClick={() => navigate('/voting-component')} sx={{ cursor: 'pointer', backgroundColor: '#3f51b5', borderRadius: '8px' }}>
              <Card sx={{ backgroundColor: 'inherit', color: '#fff' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h5" component="h2">
                    Vote Now
                  </Typography>
                  <Typography variant="body2" component="p">
                    Participate in ongoing votes.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          {isValidUser && !userLoading && (
            <Grid item xs={12} sm={6} md={6}>
              <Box onClick={() => navigate('/create-vote')} sx={{ cursor: 'pointer', backgroundColor: '#3f51b5', borderRadius: '8px' }}>
                <Card sx={{ backgroundColor: 'inherit', color: '#fff' }}>
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Typography variant="h5" component="h2">
                      Create Election
                    </Typography>
                    <Typography variant="body2" component="p">
                      Set up a new vote.
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          )}
          <Grid item xs={12} sm={6} md={6}>
            <Box onClick={() => navigate('/vote-results')} sx={{ cursor: 'pointer', backgroundColor: '#3f51b5', borderRadius: '8px' }}>
              <Card sx={{ backgroundColor: 'inherit', color: '#fff' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h5" component="h2">
                    View Results
                  </Typography>
                  <Typography variant="body2" component="p">
                    Check the vote results.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={6}>
            <Box onClick={() => navigate('/user-management')} sx={{ cursor: 'pointer', backgroundColor: '#3f51b5', borderRadius: '8px' }}>
              <Card sx={{ backgroundColor: 'inherit', color: '#fff' }}>
                <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Typography variant="h5" component="h2">
                    User Management
                  </Typography>
                  <Typography variant="body2" component="p">
                    Manage your voting activities.
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default HomePage;
