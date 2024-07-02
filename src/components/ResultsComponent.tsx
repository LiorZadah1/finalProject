import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { createContract } from '../utils/createContract';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { getCurrentVoteId } from '../utils/fetchAndUpdateVoteId';
import { useMetaMask } from "metamask-react";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress
} from '@mui/material';
import VotingSystem from "../../hardhat-tutorial/artifacts/contracts/VotingSystem.sol/VotingSystem.json";

interface Option {
  optionName: string;
  voteCount: number;
}

interface Vote {
  id: number;
  options: Option[];
  startDate: string;
  duration: number;
}

const ResultsComponent: React.FC = () => {
  const [openVotes, setOpenVotes] = useState<Vote[]>([]);
  const [closedVotes, setClosedVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { status, account } = useMetaMask();
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        if (status === "connected" && account) {
          const docRef = doc(db, 'voteManagers', account.toLowerCase());
          const docSnap = await getDoc(docRef);

          if (!docSnap.exists()) {
            throw new Error('No contract information available!');
          }

          const { contractAddress } = docSnap.data();
          const abi = VotingSystem.abi;
          if (window.ethereum) {
            const contractInstance = await createContract(window.ethereum, contractAddress, abi);
            setContract(contractInstance);

            // Fetch the results after setting the contract
            await fetchResults(contractInstance);
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
        setLoading(false);
      }
    }

    async function fetchResults(contract: ethers.Contract) {
      try {
        const votesRef = collection(db, 'votesID');
        const latestVoteId = await getCurrentVoteId();
        // const latestVoteId = latestVoteIdDoc.exists() ? latestVoteIdDoc.data().value : 0;

        console.log("Latest Vote ID:", latestVoteId);

        const q = query(votesRef, where('id', '<=', latestVoteId));
        const querySnapshot = await getDocs(q);

        console.log("Query Snapshot Docs:", querySnapshot.docs);

        const voteDocs = querySnapshot.docs.map(doc => doc.data());
        console.log("Vote Docs:", voteDocs);

        const openVotesArray: Vote[] = [];
        const closedVotesArray: Vote[] = [];

        for (const vote of voteDocs) {
          const voteID = vote.id;
          console.log(`Fetching data for vote ID: ${voteID}`);

          const optionsCount = await contract.getOptionsCount(voteID);
          console.log(`Options count for vote ID ${voteID}: ${optionsCount}`);

          const voteCounts: number[] = await contract.getVoteResults(voteID, optionsCount);
          console.log(`Vote counts for vote ID ${voteID}:`, voteCounts);

          const optionsArray: Option[] = await Promise.all(
            Array.from({ length: optionsCount }).map(async (_, i) => {
              const optionDetails = await contract.getOptionDetails(voteID, i);
              console.log(`Option details for vote ID ${voteID}, option ${i}:`, optionDetails);
              return {
                optionName: optionDetails.optionName,
                voteCount: voteCounts[i],
              };
            })
          );

          console.log(`Options array for vote ID ${voteID}:`, optionsArray);

          const startDate = new Date(Number(vote.startDate) * 1000);
          const endDate = new Date(Number(vote.startDate) * 1000 + Number(vote.duration) * 1000);

          const currentTime = new Date();
          console.log(`Vote ID: ${voteID}, Start Date: ${startDate}, End Date: ${endDate}, Current Time: ${currentTime}`);

          if (currentTime < endDate) {
            openVotesArray.push({ id: voteID, options: optionsArray, startDate: vote.startDate, duration: vote.duration });
          } else {
            closedVotesArray.push({ id: voteID, options: optionsArray, startDate: vote.startDate, duration: vote.duration });
          }
        }

        console.log("Open Votes Array:", openVotesArray);
        console.log("Closed Votes Array:", closedVotesArray);

        setOpenVotes(openVotesArray);
        setClosedVotes(closedVotesArray);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error('Error fetching vote results:', error.message);
          setError(error.message);
        } else {
          console.error('An unexpected error occurred');
          setError('An unexpected error occurred');
        }
      }
    }

    fetchData();
  }, [status, account]);

  if (loading) {
    return (
      <Container>
        <CircularProgress />
        <Typography>Loading results...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Vote Results
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom>
        Open Votes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vote ID</TableCell>
              <TableCell>Options</TableCell>
              <TableCell>Total Votes</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {openVotes.map((vote, index) => {
              const totalVotes = vote.options.reduce((acc, option) => acc + option.voteCount, 0);
              return (
                <TableRow key={index}>
                  <TableCell>{vote.id}</TableCell>
                  <TableCell>{vote.options.map(option => option.optionName).join(', ')}</TableCell>
                  <TableCell>{totalVotes}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h5" component="h2" gutterBottom>
        Closed Votes
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Vote ID</TableCell>
              <TableCell>Option Name</TableCell>
              <TableCell>Vote Count</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {closedVotes.map((vote, index) => {
              const maxVoteCount = Math.max(...vote.options.map(option => option.voteCount));
              return (
                <React.Fragment key={index}>
                  <TableRow>
                    <TableCell rowSpan={vote.options.length + 1}>{vote.id}</TableCell>
                  </TableRow>
                  {vote.options.map((option, i) => (
                    <TableRow key={i}>
                      <TableCell style={option.voteCount === maxVoteCount ? { fontWeight: 'bold' } : {}}>
                        {option.optionName}
                      </TableCell>
                      <TableCell style={option.voteCount === maxVoteCount ? { fontWeight: 'bold' } : {}}>
                        {option.voteCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default ResultsComponent;
