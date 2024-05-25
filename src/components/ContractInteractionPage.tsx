import React, { useState, useEffect } from 'react';
import { createContract } from '../utils/createContract';
import { Contract } from 'ethers';

const ContractInteractionPage: React.FC = () => {
    const [contract, setContract] = useState<Contract | null>(null);

    useEffect(() => {
        const contractAddress = "your_contract_address_here";
        // You should specify the type for your ABI or import it if you have a type definition
        const contractABI = require("../path_to_contract_ABI.json");

        if (window.ethereum) {
            createContract(window.ethereum, contractAddress, contractABI)
                .then(setContract)
                .catch(console.error);
        }
    }, []);

    if (!contract) {
        return <div>Loading contract...</div>;
    }

    // Example interaction (assuming your contract has a callable function)
    const handleContractInteraction = async () => {
        try {
            if (!contract) throw new Error("Contract is not loaded.");
            // You must replace `yourContractMethod` with a real method name from your contract
            const response = await contract.yourContractMethod();
            console.log('Contract response:', response);
        } catch (error) {
            console.error('Error interacting with contract:', error);
        }
    };

    return (
        <div>
            <h1>Contract Interaction</h1>
            <button onClick={handleContractInteraction}>Interact with Contract</button>
        </div>
    );
};

export default ContractInteractionPage;
