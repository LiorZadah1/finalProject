import React, { useState, useEffect } from 'react';
import { useMetaMask } from "metamask-react";
import { ethers } from 'ethers';
import { createContract } from '../utils/createContract';
import { db } from '../firebaseConfig'; // Import Firestore configuration
import { doc, getDoc } from 'firebase/firestore';

interface Vote {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    status: boolean;
}

const VoteTable = () => {
    const { account, ethereum } = useMetaMask();
    const [votes, setVotes] = useState<Vote[]>([]);
    const [contract, setContract] = useState<ethers.Contract | null>(null);

    // Fetch and instantiate the contract
    useEffect(() => {
        const fetchContractDetails = async () => {
            const docRef = doc(db, 'contracts', 'your_contract_doc_id');
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (ethereum) {
                    const contractInstance = await createContract(ethereum, data.address, data.abi);
                    setContract(contractInstance);
                }
            } else {
                console.error("Contract details not found!");
            }
        };

        fetchContractDetails();
    }, [ethereum]);

    // Fetch the votes from the blockchain once the contract is ready
    useEffect(() => {
        const fetchVotes = async () => {
            if (contract && account) {
                try {
                    // ----- > need to insert here function that will return the votes that he can vote, based on the groupID.
                    const voteData = await contract.getAccessibleVotes(account);
                    const formattedVotes = voteData.map(vote => ({
                        id: vote.id.toString(),
                        name: vote.name,
                        startDate: new Date(vote.startDate * 1000).toISOString(),
                        endDate: new Date(vote.endDate * 1000).toISOString(),
                        status: vote.open
                    }));
                    setVotes(formattedVotes);
                } catch (error) {
                    console.error('Error fetching votes:', error);
                }
            }
        };

        fetchVotes();
    }, [contract, account]);

    return (
        <div>
            {votes.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {votes.map((vote) => (
                            <tr key={vote.id}>
                                <td>{vote.name}</td>
                                <td>{vote.startDate}</td>
                                <td>{vote.endDate}</td>
                                <td>{vote.status ? 'Open' : 'Closed'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : <p>No votes available or loading data...</p>}
        </div>
    );
};

export default VoteTable;
