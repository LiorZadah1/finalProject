// src/hooks/useContract.ts

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createContract } from '../utils/createContract';

const useContract = (ethereum: any, contractAddress: string, contractABI: any): [ethers.Contract | null, boolean, any] => {
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    useEffect(() => {
        async function initContract() {
            setLoading(true);
            try {
                const contractInstance = await createContract(ethereum, contractAddress, contractABI);
                setContract(contractInstance);
            } catch (err) {
                setError(err);
                console.error("Failed to create contract:", err);
            } finally {
                setLoading(false);
            }
        }

        if (ethereum) {
            initContract();
        }
    }, [ethereum, contractAddress, contractABI]);

    return [contract, loading, error];
};

export default useContract;
