import { useEffect, useState } from 'react';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useMetaMask } from "metamask-react";

const useCheckUser = (): [boolean | null, boolean] => {
  const { status, account } = useMetaMask();
  const [isValidUser, setIsValidUser] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkUser = async () => {
      if (status === "connected" && account) {
        console.log(`Checking account: ${account}`);
        try {
          // Check if the user is in the voteManagers collection
          const docRef = doc(db, 'voteManagers', account);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            console.log(`User document found for account: ${account}`);
            setIsValidUser(true);
          } else {
            console.log(`No user document found for account: ${account}, checking group membership.`);
            // Check if the user is part of any group
            const q = query(collection(db, 'voteManagers'), where(`group.${account.toLowerCase()}`, 'array-contains', account.toLowerCase()));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
              console.log(`User is part of a group in account: ${account}`);
              setIsValidUser(true);
            } else {
              console.log(`User is not part of any group: ${account}`);
              setIsValidUser(false);
            }
          }
        } catch (error) {
          console.error('Error checking user:', error);
          setIsValidUser(false);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
        setIsValidUser(false);
      }
    };

    checkUser();
  }, [status, account]);

  return [isValidUser, loading];
};

export default useCheckUser;
