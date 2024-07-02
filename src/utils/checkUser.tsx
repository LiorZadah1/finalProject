// src/utils/checkUser.tsx
import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
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
          const docRef = doc(db, 'voteManagers', account);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            console.log(`User document found for account: ${account}`);
            setIsValidUser(true);
          } else {
            console.error(`No user document found for account: ${account}`);
            setIsValidUser(false);
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
