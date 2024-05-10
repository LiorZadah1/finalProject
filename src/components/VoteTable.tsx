import React, { useState, useEffect } from 'react';

const VoteTable = () => {
    const [votes, setVotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data - replace this with blockchain data fetching logic
    useEffect(() => {
        const fetchVotes = async () => {
            // Placeholder for fetching data from the blockchain
            const mockVotes = [
                { id: 1, name: 'Election 2024', startDate: '2024-01-01', endDate: '2024-01-31', open: true },
                { id: 2, name: 'Referendum 2023', startDate: '2023-05-05', endDate: '2023-05-25', open: true }
            ];
            setVotes(mockVotes.filter(vote => vote.open && vote.name.toLowerCase().includes(searchTerm.toLowerCase())));
        };

        fetchVotes();
    }, [searchTerm]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Search votes..."
                value={searchTerm}
                onChange={handleSearch}
                style={{ marginBottom: '20px' }}
            />
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Vote</th>
                    </tr>
                </thead>
                <tbody>
                    {votes.map((vote) => (
                        <tr key={vote.id}>
                            <td>{vote.name}</td>
                            <td>{vote.startDate}</td>
                            <td>{vote.endDate}</td>
                            <td>
                                <button onClick={() => window.location.href=`/vote/${vote.id}`}>
                                    Go to Vote
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default VoteTable;
