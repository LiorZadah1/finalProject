import React, { useState , useEffect } from 'react';
import { ethers } from 'ethers';

const ElectionForm: React.FC = () => {
  const [contractABI, setContractABI] = useState<any>(null);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [voteName, setVoteName] = useState('');
  const [startVoteTime, setStartVoteTime] = useState('');
  const [endVoteTime, setEndVoteTime] = useState('');
  const [groupId, setGroupId] = useState('');

  useEffect(() => {
    const fetchABIAndAddress = async () => {
      try {
        const abiResponse = await fetch('../abi&address/ContractABI.json');
        const abiData = await abiResponse.json();
        setContractABI(abiData);
  
        const addressResponse = await fetch('../abi&address/ContractAddress.json');
        const addressData = await addressResponse.json();
        setContractAddress(addressData.address);
      } catch (error) {
        console.error('Failed to load contract data:', error);
        // Optionally update the state to show an error message in the UI
      }
    };
  
    fetchABIAndAddress();
  }, []);
  

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!window.ethereum) {
      alert('Please install MetaMask to interact with the blockchain.');
      return;
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner(); // Make sure to await the Promise here
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
      const tx = await contract.createVote(
        voteName,
        BigInt(Date.parse(startVoteTime) / 1000),
        BigInt(Date.parse(endVoteTime) / 1000),
        BigInt(groupId)
      );
      await tx.wait();
      alert('Vote successfully created!');
    }  catch (error: unknown) {
      // Check if error is an instance of Error
      if (error instanceof Error) {
        alert(`Failed to create the vote: ${error.message}`);
      } else {
        // Handle cases where the error is not an Error instance
        alert('Failed to create the vote due to an unexpected error.');
      }
    }
  };

  // Ensure ABI and address are loaded before rendering form
  if (!contractABI || !contractAddress) {
    return <div>Loading contract data...</div>;
  }

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
