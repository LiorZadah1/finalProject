import React, { useState, useEffect } from 'react';
import { createContract } from '../utils/createContract';
import { Contract } from 'ethers';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';  
import { useMetaMask } from "metamask-react";

const ContractInteractionPage: React.FC = () => {
    const [contract, setContract] = useState<Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const { status, account } = useMetaMask();
    useEffect(() => {
        const loadContractDetails = async () => {
            try {
                // Assuming the document ID of your contract details is known or set as an environment variable
                if (status === "connected") {
                    const docRef = doc(db, 'contracts', account);
                    const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    if (window.ethereum && data.address && data.abi) {
                        const loadedContract = await createContract(window.ethereum, data.address, JSON.parse(data.abi));
                        setContract(loadedContract);
                    } else {
                        throw new Error("Contract data is incomplete or missing.");
                    }
                } else {
                    throw new Error("No contract data found in Firestore.");
                }
            }
            } catch (error) {
                console.error("Error loading contract data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadContractDetails();
    }, []);

    if (loading) {
        return <div>Loading contract...</div>;
    }

    const handleContractInteraction = async () => {
        if (!contract) {
            console.error("Contract is not loaded.");
            return;
        }
        try {
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
            <button onClick={handleContractInteraction} disabled={!contract}>
                Interact with Contract
            </button>
        </div>
    );
};

export default ContractInteractionPage;
