// src/hooks/useFetchUserDetails.tsx
import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface UserDetails {
  address: string;
  contractAddress: string;
}

const useFetchUserDetails = (account: string): [UserDetails | null, boolean, string | null] => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const voteManagersRef = collection(db, 'voteManagers');
        const querySnapshot = await getDocs(voteManagersRef);
        for (const docSnapshot of querySnapshot.docs) {
          const data = docSnapshot.data();
          const groups = data.group;
          for (const groupId in groups) {
            if (groups[groupId].includes(account.toLowerCase())) {
              setUserDetails({
                address: data.address,
                contractAddress: data.contractAddress,
              });
              setLoading(false);
              return;
            }
          }
        }
        setError('User not found in any group.');
      } catch (error: unknown) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('An unexpected error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    if (account) {
      fetchUserDetails();
    } else {
      setLoading(false);
      setError('No account provided');
    }
  }, [account]);

  return [userDetails, loading, error];
};

export default useFetchUserDetails;
