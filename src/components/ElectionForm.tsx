import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createContract } from '../utils/createContract';
import {db} from '../firebaseConfig'; // Import Firestore configuration
import { doc, getDoc } from 'firebase/firestore';
import { useMetaMask } from "metamask-react";

const ElectionForm: React.FC = () => {
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [voteName, setVoteName] = useState('');
    const [startVoteTime, setStartVoteTime] = useState('');
    const [endVoteTime, setEndVoteTime] = useState('');
    const [groupId, setGroupId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { status, account } = useMetaMask();

    useEffect(() => {
      async function fetchData() {
          try {
            if (status === "connected") {
              const docRef = doc(db, 'contracts', account);
              const docSnap = await getDoc(docRef);
  
              if (!docSnap.exists()) {
                  throw new Error('No contract information available!');
              }
  
              const { abi, address } = docSnap.data();
              if (!abi || !address) {
                  throw new Error('Contract ABI or address is missing.');
              }
  
              if (window.ethereum) {
                  const contractInstance = await createContract(window.ethereum, address, abi);
                  setContract(contractInstance);
              } else {
                  throw new Error('Ethereum object is not available.');
              }
            }
          } catch (error: unknown) {
              if (error instanceof Error) {
                  console.error('Failed to load contract:', error.message);
                  setError(error.message);
              } else {
                  console.error('An unexpected error occurred');
                  setError('An unexpected error occurred');
              }
          } finally {
              setIsLoading(false);
          }
      }
  
      fetchData();
  }, []);
    if (isLoading) {
        return <div>Loading contract data...</div>;
    }

    if (!contract) {
        return <div>{error || 'Contract is not loaded.'}</div>;
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            const tx = await contract.createVote(
                voteName,
                BigInt(Date.parse(startVoteTime) / 1000),
                BigInt(Date.parse(endVoteTime) / 1000),
                BigInt(groupId)
            );
            await tx.wait();
            alert('Vote successfully created!');
        } catch (error: unknown) {
              if (error instanceof Error) {
                  console.error('Failed to load contract:', error.message);
                  setError(error.message);
              } else {
                  console.error('An unexpected error occurred');
                  setError('An unexpected error occurred');
              }
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
