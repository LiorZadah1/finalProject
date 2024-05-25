import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createContract } from '../utils/createContract';
import {db} from '../firebaseConfig'; // Import Firestore configuration
import { doc, getDoc } from 'firebase/firestore';

const ElectionForm: React.FC = () => {
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [contractABI, setContractABI] = useState<any>(null);
    const [contractAddress, setContractAddress] = useState<string>('');
    const [voteName, setVoteName] = useState('');
    const [startVoteTime, setStartVoteTime] = useState('');
    const [endVoteTime, setEndVoteTime] = useState('');
    const [groupId, setGroupId] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
      async function fetchData() {
          try {
              const docRef = doc(db, 'contracts', 'YOUR_CONTRACT_DOC_ID'); // Correct way to reference a document
              const docSnap = await getDoc(docRef);

              if (!docSnap.exists()) {
                  throw new Error('No such document!');
              }

              const data = docSnap.data();
              setContractABI(data?.abi);
              setContractAddress(data?.address);

              if (data?.abi && data?.address && window.ethereum) {
                  const contractInstance = await createContract(window.ethereum, data.address, data.abi);
                  setContract(contractInstance);
              }
          } catch (error) {
              console.error('Error loading contract data:', error);
              setError('Failed to load contract data. Please check the console for more details.');
          }
      }

      fetchData();
  }, []);

    if (!contract) {
        return <div>{error || 'Loading contract data...'}</div>;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!contract) {
            alert('Contract is not loaded.');
            return;
        }

        try {
            const tx = await contract.createVote(
                voteName,
                BigInt(Date.parse(startVoteTime) / 1000),
                BigInt(Date.parse(endVoteTime) / 1000),
                BigInt(groupId)
            );
            await tx.wait();
            alert('Vote successfully created!');
        }  catch (error: any) {
            alert(`Failed to create the vote: ${error.message}`);
        }
    };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Vote Name:
          <input type="text" value={voteName} onChange={e => setVoteName(e.target.value)} />
        </label>
      </div>
      <div>
        <label>Start Vote Time:
          <input type="datetime-local" value={startVoteTime} onChange={e => setStartVoteTime(e.target.value)} />
        </label>
      </div>
      <div>
        <label>End Vote Time:
          <input type="datetime-local" value={endVoteTime} onChange={e => setEndVoteTime(e.target.value)} />
        </label>
      </div>
      <div>
        <label>Group ID:
          <input type="number" value={groupId} onChange={e => setGroupId(e.target.value)} />
        </label>
      </div>
      <button type="submit">Create Vote</button>
    </form>
  );
};

export default ElectionForm;
