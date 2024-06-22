import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';

export async function getGroupIdForUser(userAddress: string): Promise<number | null> {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data() as { group: Record<string, string[]> };
      for (const groupId in userData.group) {
        if (userData.group[groupId].includes(userAddress.toLowerCase())) {
          return Number(groupId);
        }
      }
    }
  } catch (error) {
    console.error('Error fetching user group:', error);
  }
  return null;
}
