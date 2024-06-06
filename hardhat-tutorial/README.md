# Voting System Smart Contract

## Overview
This smart contract is designed to manage a flexible voting system on the Ethereum blockchain. It allows an admin (typically the deployer) to create multiple votes, each with its own set of options and eligible voters. The system supports adding voters, casting votes, and retrieving vote results.

## Features
Admin Management: Only the admin can create votes and add voters.
Dynamic Vote Creation: Votes can be created at any time with a custom set of options.
Voter Validation: Ensures that only registered and eligible voters can cast votes.
Result Retrieval: Allows fetching the results of a vote to see how many votes each option received.

## Smart Contract Methods
* createVote: Admin can create a vote specifying its duration, options, and eligible voters.
* addVoter: Admin can add a new voter to an existing vote.
* castVote: Registered voters can cast their vote for a specific option.
* getVoteResults: Retrieve the total counts of votes for each option in a vote.

## Setup and Deployment
Deploy Contract: Deploy the contract to an Ethereum blockchain (testnet or mainnet).
```javascript
truffle migrate --reset

```
## Usage Example
### Create a Vote
Create a new vote with predefined options and settings.
```javascript
const voteId = 1;
const voteName = "Election 2024";
const startTime = 60; // Voting starts in 60 seconds from now
const duration = 86400; // Voting duration of 1 day
const groupId = 1;
const votingOptions = ["Option A", "Option B", "Option C"];

await votingSystem.createVote(voteId, voteName, startTime, duration, groupId, votingOptions, { from: adminAddress });
```
### Add a Voter
Add a voter to an existing vote.
```javascript
const voterAddress = "0x123...";
await votingSystem.addVoter(voteId, voterAddress, groupId, { from: adminAddress });
```
### Cast a Vote
A registered voter casts their vote.
```javascript
const selectedOptionIndex = 0;
await votingSystem.castVote(voteId, selectedOptionIndex, { from: voterAddress });
```
### Get Vote Results
Retrieve the results of a vote.
```javascript
const results = await votingSystem.getVoteResults(voteId, votingOptions.length, { from: anyAddress });
console.log("Vote counts: ", results);
```

## Important Considerations
Ensure that the contract is used by Ethereum's gas and timing constraints.
Test thoroughly on a testnet before deploying to the mainnet to avoid costly errors.


## all rights reserved to Lior Zadah & Raz Rozner
