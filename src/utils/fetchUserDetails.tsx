// fetchUserDetails.tsx
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useMetaMask } from "metamask-react";

interface UserDetails {
  address: string;
  contractAddress: string;
}

const fetchUserDetails = async (): Promise<UserDetails | null> => {
  const { status, account } = useMetaMask();
  if (status === "connected" && account) {
    console.log(`Fetching details for account: ${account}`);
    try {
      const managersSnapshot = await getDocs(collection(db, 'voteManagers'));
      let userDetails: UserDetails | null = null;

      managersSnapshot.forEach(managerDoc => {
        if (userDetails) return; // Exit early if user is found

        const managerData = managerDoc.data();
        if (managerData.group) {
          Object.values(managerData.group).forEach((group) => {
            if (Array.isArray(group) && group.includes(account.toLowerCase())) {
              userDetails = {
                address: managerData.address,
                contractAddress: managerData.contractAddress,
              };
            }
          });
        }
      });

      if (!userDetails) {
        console.log(`User not found in any group: ${account}`);
      }

      return userDetails;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  } else {
    return null;
  }
};

export default fetchUserDetails;
