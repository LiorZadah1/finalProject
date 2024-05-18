import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';

// Import ABI and contract address from local files.
const contractABI = require('/abi&address/ContractABI.json').contractABI;
const contractAddress = require('/abi&address/ContractAddress.json').contractAddress;

// Define the structure of an option as expected from the smart contract.
interface Option {
  optionName: string;
  countOption: number;
}

const VotingProcess: React.FC = () => {
  // State for holding the list of voting options.
  const [options, setOptions] = useState<Option[]>([]);
  // State for tracking the currently selected voting option by the user.
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  // State to indicate if a vote is currently being submitted.
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State to track if the vote has been successfully submitted.
  const [voteSubmitted, setVoteSubmitted] = useState(false);

  // useEffect hook to setup the contract interaction when the component mounts.
  useEffect(() => {
    async function setupContract() {
      // Connect to Ethereum network using a browser provider.
      const provider = new ethers.BrowserProvider(window.ethereum);
      // Get a signer from the provider, which is required to send transactions.
      const signer = await provider.getSigner();
      // Create a contract object to interact with the smart contract.
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Function to fetch voting options from the smart contract.
      async function fetchOptions() {
        const voteID = 1; // Example vote ID, this should be dynamically determined based on the context.
        const optionsCount = await contract.getOptionsCount(voteID);
        const optionsArray: Option[] = [];
        for (let i = 0; i < optionsCount; i++) {
          const option = await contract.getOptionDetails(voteID, i);
          optionsArray.push({
            optionName: option.optionName,
            countOption: option.countOption
          });
        }
        // Update the state with the fetched options.
        setOptions(optionsArray);
      }

      // Execute the fetch function.
      await fetchOptions();
    }

    // Initialize the contract setup and catch any errors that occur.
    setupContract().catch(console.error);
  }, []);

  // Function to handle when a user submits their vote.
  const handleVote = async () => {
    // Do nothing if no option is selected.
    if (selectedOption === null) return;
    // Indicate that a vote submission is in progress.
    setIsSubmitting(true);

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);

    try {
      // Call the castVote method from the smart contract.
      await contract.castVote(1, selectedOption);
      // Update the state to show that the vote has been submitted.
      setVoteSubmitted(true);
    } catch (error) {
      console.error('Error submitting vote:', error);
    } finally {
      // Reset the submitting state regardless of the outcome.
      setIsSubmitting(false);
    }
  };

  // Render a thank you message if the vote has been submitted.
  if (voteSubmitted) {
    return <div>Thank you for voting!</div>;
  }

  // Main component rendering.
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
