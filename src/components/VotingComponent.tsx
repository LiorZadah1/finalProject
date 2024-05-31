import React, { useState, useEffect } from 'react';
import { createContract } from '../utils/createContract';
import { db } from '../firebaseConfig'; // Import Firestore configuration
import { doc, getDoc } from 'firebase/firestore';
import { ethers } from 'ethers';
import { useMetaMask } from "metamask-react";

// Define the structure of an option as expected from the smart contract.
interface Option {
  optionName: string;
  countOption: number;
}


const VotingProcess: React.FC = () => {
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const { status, account } = useMetaMask();
  useEffect(() => {
    async function setupContract() {
      try {
        //Check if the user is connected and fetch the params using his address
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

          const contractInstance = await createContract(window.ethereum, address, abi);
          setContract(contractInstance);
          await fetchOptions(contractInstance);
        }
      } catch (error) {
        console.error('Error setting up the contract:', error);
      }
    }

    async function fetchOptions(contract) {
      const voteID = 1; // Example vote ID, dynamically determine this as needed
      const optionsCount = await contract.getOptionsCount(voteID);
    
      // Create an array of fetch promises
      const fetchPromises = Array.from({ length: optionsCount }, async (_, index) => {
        const option = await contract.getOptionDetails(voteID, index);
        return {
          optionName: option.optionName,
          countOption: option.countOption
        };
      });
    
      // Wait for all promises to resolve and then set the options state
      const optionsArray: Option[] = await Promise.all(fetchPromises);
      setOptions(optionsArray);
    }
    

    setupContract();
  }, []);

  const handleVote = async () => {
    if (selectedOption === null || !contract) return;
    setIsSubmitting(true);

    try {
      await contract.castVote(1, selectedOption);
      setVoteSubmitted(true);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (voteSubmitted) {
    return <div>Thank you for voting!</div>;
  }

  return (
    <div>
      <h1>Vote on an Option</h1>
      {options.map((option, index) => (
        <div key={index}>
          <label>
            <input
              type="radio"
              name="option"
              value={index}
              onChange={() => setSelectedOption(index)}
              disabled={isSubmitting}
            />
            {option.optionName} (Votes: {option.countOption})
          </label>
        </div>
      ))}
      <button onClick={handleVote} disabled={isSubmitting || selectedOption === null}>
        Submit Vote
      </button>
    </div>
  );
};

export default VotingProcess;
