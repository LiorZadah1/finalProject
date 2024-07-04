import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, CircularProgress } from '@mui/material';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useMetaMask } from 'metamask-react';

const UserGroupAddresses: React.FC = () => {
  const { account } = useMetaMask();
  const [groupAddresses, setGroupAddresses] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupAddresses = async () => {
      if (account) {
        try {
          const userDocRef = doc(db, 'voteManagers', account.toLowerCase());
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as { group: Record<string, string[]> };
            setGroupAddresses(userData.group);
          } else {
            throw new Error('User data not found');
          }
        } catch (error: unknown) {
          if (error instanceof Error) {
            setError(error.message);
          } else {
            setError('An unexpected error occurred');
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchGroupAddresses();
  }, [account]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  return (
    <Box mt={0}>
      <Typography variant="h4" component="h2" gutterBottom>
        Group Addresses
      </Typography>
      {Object.entries(groupAddresses).map(([groupId, addresses]) => (
        <Paper key={groupId} elevation={3} style={{ marginBottom: '16px', overflow: 'hidden' }}>
          <Box p={2}>
            <Typography variant="h6" component="h3" gutterBottom>
              Group ID: {groupId}
            </Typography>
            {addresses.length > 0 ? (
              <ul style={{ paddingLeft: '16px', wordBreak: 'break-word' }}>
                {addresses.map((address) => (
                  <li key={address}>{address}</li>
                ))}
              </ul>
            ) : (
              <Typography variant="body2">No addresses in this group.</Typography>
            )}
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default UserGroupAddresses;
