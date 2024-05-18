import React, { useState , useEffect } from 'react';
import { ethers } from 'ethers';

const ElectionForm: React.FC = () => {
  const [contractABI, setContractABI] = useState<any>(null);
  const [contractAddress, setContractAddress] = useState<string>('');
  const [voteName, setVoteName] = useState('');
  const [startVoteTime, setStartVoteTime] = useState('');
  const [endVoteTime, setEndVoteTime] = useState('');
  const [groupId, setGroupId] = useState('');
  const [error, setError] = useState<string | null>(null); // Specify that error can be string or null

  //All this part will be changed when we will deploy the functionality that the use is deploing the smart contract!
  useEffect(() => {
    async function fetchData() {
      try {
        const abiResponse = await fetch('/abi&address/ContractABI.json');
        if (!abiResponse.ok) throw new Error(`Failed to fetch ABI: Status ${abiResponse.status}`);
        if (!abiResponse.headers.get("content-type")?.includes("application/json")) {
          throw new Error("Not a JSON response");
        }
        const abiData = await abiResponse.json();
        setContractABI(abiData.contractABI);
  
        const addressResponse = await fetch('/abi&address/ContractAddress.json');
        if (!addressResponse.ok) throw new Error(`Failed to fetch Address: Status ${addressResponse.status}`);
        if (!addressResponse.headers.get("content-type")?.includes("application/json")) {
          throw new Error("Not a JSON response");
        }
        const addressData = await addressResponse.json();
        setContractAddress(addressData.contractAddress);
        console.log(abiData);  // Check what's inside abiData
        console.log(addressData);  // Check address data

      } catch (error) {
        console.error('Error loading contract data:', error);
        setError('Failed to load contract data. Please check the console for more details.');
      }
    }
  
    fetchData();
  }, []);

  if (!contractABI || !contractAddress) {
    return <div>{error || 'Loading contract data...'}</div>;  // Use the error state in the UI
  }
  
  

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

  // if (!contractABI || !contractAddress) {
  //   return error ? <div>Error loading contract data. Please check the console for more information.</div> : <div>Loading contract data...</div>;
  // }
  

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
