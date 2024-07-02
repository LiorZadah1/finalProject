//import { Address } from 'web3';
import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';

interface User {
  group: {
    [key: string]: string[];
  };
}

export const getUsersByGroupId = async (address: string, groupId: string): Promise<string[]> => {
  const userDocRef = doc(db, 'voteManagers', address.toLowerCase());
  const userDocSnap = await getDoc(userDocRef);

  const addresses: string[] = [address.toLowerCase()]; // Initialize with the given address

  if (userDocSnap.exists()) {
    const userData = userDocSnap.data() as User;
    if (userData.group && userData.group[groupId]) {
      addresses.push(...userData.group[groupId]);
    }
  }

  return addresses;
};


/**
 * Initializes the vote ID counter in Firestore if it doesn't exist.
 */
export async function initializeVoteCounter() {
  const counterRef = doc(db, 'votesID', 'currentID');
  const docSnap = await getDoc(counterRef);
  if (!docSnap.exists()) {
    await setDoc(counterRef, { currentID: 0 });
  }
}

/**
 * Fetches the current vote ID without incrementing it.
 * @returns The current vote ID.
 */
export async function getCurrentVoteId(): Promise<number> {
  const counterRef = doc(db, 'votesID', 'currentID');
  const docSnap = await getDoc(counterRef);
  if (docSnap.exists()) {
    return docSnap.data().currentID;
  } else {
    throw new Error('Vote ID counter not initialized.');
  }
}

/**
 * Increments and fetches the next vote ID.
 * @returns The next vote ID.
 */
export async function fetchAndUpdateVoteId(): Promise<number> {
  const counterRef = doc(db, 'votesID', 'currentID');
  const docSnap = await getDoc(counterRef);
  if (docSnap.exists()) {
    await updateDoc(counterRef, { currentID: increment(1) });
    return docSnap.data().currentID + 1;
  } else {
    throw new Error('Vote ID counter not initialized.');
  }
}

// Initialize the vote counter when this module is imported.
initializeVoteCounter().catch(console.error);
