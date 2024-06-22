// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract VotingSystem {

    struct Voter {
        address addressVoter; 
        bool isRegistered; 
        bool hasVoted; 
        uint voteIndex; 
        uint groupId; 
    }

    struct Option { 
        string optionName;
        uint countOption; 
    }

    struct Group {
        uint groupId;
        string groupName;
    }

    struct Vote {
        string voteName; 
        uint voteID;
        uint startVoteTime; 
        uint endVoteTime; 
        mapping(uint => Option) options; 
        mapping(address => Voter) voters; 
        uint groupId; 
        uint optionsCount;
        bool open;
    }

    modifier onlyAdmin {
        require(msg.sender == admin, "Only the Administrator allowed make this action");
        _;
    }

    address admin; 
    uint public nextVoteID = 1;
    mapping(uint => Vote) public votes; 

    constructor() {
        admin = msg.sender;
    }

    function addVoter(uint voteID, address voterAddress, uint groupId) public onlyAdmin {
        require(block.timestamp < votes[voteID].endVoteTime, "Voting time has ended.");
        require(!votes[voteID].voters[voterAddress].isRegistered, "The voter exists already in the system.");
        votes[voteID].voters[voterAddress] = Voter({
            addressVoter: voterAddress,
            isRegistered: true,
            hasVoted: false,
            voteIndex: 0,
            groupId: groupId
        });
    }

    function createVote(uint voteID, string memory voteName, uint startTime, uint duration, uint groupId, string[] memory voting_options) public onlyAdmin {
        votes[voteID].voteID = voteID;
        votes[voteID].voteName = voteName;
        votes[voteID].startVoteTime = block.timestamp + startTime;
        votes[voteID].endVoteTime = votes[voteID].startVoteTime + duration;
        votes[voteID].groupId = groupId;
        votes[voteID].optionsCount = voting_options.length;

        for (uint i = 0; i < voting_options.length; i++) {
            votes[voteID].options[i] = Option(voting_options[i], 0);
        }
        nextVoteID++;
    }

    function getVoteResults(uint voteID, uint optionsCount) public view returns (uint[] memory) {
        uint[] memory voteCounts = new uint[](optionsCount);
        for (uint i = 0; i < optionsCount; i++) {
            voteCounts[i] = votes[voteID].options[i].countOption;
        }
        return voteCounts;
    }

    function getOptionsCount(uint voteID) public view returns (uint) {
        return votes[voteID].optionsCount;
    }

    function getOptionDetails(uint voteID, uint optionIndex) public view returns (string memory optionName, uint countOption) {
        Option storage option = votes[voteID].options[optionIndex];
        return (option.optionName, option.countOption);
    }

    function getAccessibleVotes(uint groupId) public view returns (uint[] memory voteIDs, string[] memory voteNames, uint[] memory startVoteTimes, uint[] memory endVoteTimes, bool[] memory openStatuses) {
    uint count = 0;
    for (uint i = 1; i < nextVoteID; i++) {
        if (votes[i].groupId == groupId) {
            count++;
        }
    }

    voteIDs = new uint[](count);
    voteNames = new string[](count);
    startVoteTimes = new uint[](count);
    endVoteTimes = new uint[](count);
    openStatuses = new bool[](count);

    uint index = 0;
    for (uint i = 1; i < nextVoteID; i++) {
        if (votes[i].groupId == groupId) {
            voteIDs[index] = votes[i].voteID;
            voteNames[index] = votes[i].voteName;
            startVoteTimes[index] = votes[i].startVoteTime;
            endVoteTimes[index] = votes[i].endVoteTime;
            openStatuses[index] = votes[i].open;
            index++;
        }
    }
    }

    function castVote(uint voteID, uint optionIndex) public {
        require(votes[voteID].voters[msg.sender].isRegistered, "Voter is not registered for this vote.");
        require(!votes[voteID].voters[msg.sender].hasVoted, "Voter has already voted.");
        require(block.timestamp >= votes[voteID].startVoteTime && block.timestamp <= votes[voteID].endVoteTime, "Voting is not currently active.");
        require(votes[voteID].groupId == votes[voteID].voters[msg.sender].groupId, "Voter is not part of the group for this vote.");

        votes[voteID].voters[msg.sender].hasVoted = true;
        votes[voteID].voters[msg.sender].voteIndex = optionIndex;

        votes[voteID].options[optionIndex].countOption++;
    }
}
