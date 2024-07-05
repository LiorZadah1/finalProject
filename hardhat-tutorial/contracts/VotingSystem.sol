// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

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
        uint duration; 
        Option[] options;
        Voter[] voters;
        mapping(address => uint) voterIndexMap;
        uint groupId; 
        uint optionsCount;
        bool open;
    }

    struct VoteDetails {
        uint voteID;
        string voteName;
        uint startVoteTime;
        uint duration;
        uint groupId;
        bool open;
    }

    struct ParticipatedVoteDetails {
        uint voteID;
        string voteName;
        uint startVoteTime;
        uint duration;
        bool open;
    }

    modifier onlyAdmin {
        require(msg.sender == admin, "Only the Administrator allowed make this action");
        _;
    }

    address public admin; 
    uint public nextVoteID;
    mapping(uint => Vote) public votes; 
    mapping(uint => address) public voteAdmins;

    constructor() {
        admin = msg.sender;
    }

    function addVoters(uint voteID, address[] memory voterAddreses, uint groupId) public onlyAdmin {
        require(votes[voteID].voteID != 0, "Vote does not exist");
        Vote storage vote = votes[voteID];
        uint endVoteTime = vote.startVoteTime + vote.duration;
        require(block.timestamp < endVoteTime, "Voting time has ended.");
        for (uint i = 0; i < voterAddreses.length; i++){
            //require(vote.voterIndexMap[voterAddreses[i]] == 0, "The voter exists already in the system.");
            if (vote.voterIndexMap[voterAddreses[i]] != 0)
                //the voter is already in the system
                continue;
            vote.voters.push(Voter(voterAddreses[i], true, false, voteID, groupId));
            vote.voterIndexMap[voterAddreses[i]] = vote.voters.length;
        }
    }

    function addOneVoter(uint voteID, address voterAddreses, uint groupId) public onlyAdmin {
        require(votes[voteID].voteID != 0, "Vote does not exist");
        Vote storage vote = votes[voteID];
        uint endVoteTime = vote.startVoteTime + vote.duration;
        require(block.timestamp < endVoteTime, "Voting time has ended.");
        //require(vote.voterIndexMap[voterAddreses] == 0, "The voter exists already in the system.");
        if (vote.voterIndexMap[voterAddreses] != 0)
                //the voter is already in the system
                return;
        vote.voters.push(Voter(voterAddreses, true, false, voteID, groupId));
        vote.voterIndexMap[voterAddreses] = vote.voters.length;
    }

    function createVote(uint voteID, string memory voteName, uint startTime, uint duration, uint groupId, string[] memory voting_options) public onlyAdmin {
        nextVoteID = voteID;
        Vote storage newVote = votes[nextVoteID];
        newVote.voteName = voteName;
        newVote.voteID = nextVoteID;
        newVote.startVoteTime = startTime;
        newVote.duration = duration;
        newVote.groupId = groupId;
        newVote.optionsCount = 0;
        newVote.open = true;

        for (uint i = 0; i < voting_options.length; i++) {
            addOption(nextVoteID, voting_options[i]);
        }
        voteAdmins[nextVoteID] = msg.sender;
        addOneVoter(nextVoteID, msg.sender, groupId);
    }

    // function getVoteResults(uint voteID) public view returns (uint[] memory) {
    //     uint[] memory voteCounts = new uint[](votes[voteID].options.length);
    //     for (uint i = 0; i < votes[voteID].options.length; i++) {
    //         voteCounts[i] = votes[voteID].options[i].countOption;
    //     }
    //     return voteCounts;
    // }

    function addOption(uint voteID, string memory optionName) public {
        require(votes[voteID].voteID != 0, "Vote does not exist");
        votes[voteID].options.push(Option(optionName, 0));
        votes[voteID].optionsCount++;
    }

    function getOptionsCount(uint voteID) public view returns (uint) {
        return votes[voteID].optionsCount;
    }

    function getOptionDetails(uint voteID, uint optionIndex) public view returns (string memory optionName, uint countOption) {
        Option storage option = votes[voteID].options[optionIndex];
        return (option.optionName, option.countOption);
    }

    function getAccessibleVotes(uint groupId) public view returns (uint[] memory voteIDs, string[] memory voteNames, uint[] memory startVoteTimes, uint[] memory durations, bool[] memory openStatuses) {
        uint count = 0;
        for (uint i = 1; i <= nextVoteID; i++) {
            if (votes[i].groupId == groupId) {
                count++;
            }
        }

        voteIDs = new uint[](count);
        voteNames = new string[](count);
        startVoteTimes = new uint[](count);
        durations = new uint[](count);
        openStatuses = new bool[](count);

        uint index = 0;
        for (uint i = 1; i <= nextVoteID; i++) {
            if (votes[i].groupId == groupId) {
                voteIDs[index] = votes[i].voteID;
                voteNames[index] = votes[i].voteName;
                startVoteTimes[index] = votes[i].startVoteTime;
                durations[index] = votes[i].duration;
                openStatuses[index] = votes[i].open;
                index++;
            }
        }
        return (voteIDs, voteNames, startVoteTimes, durations, openStatuses);
    }

    function castVote(uint voteID, uint optionIndex) public {
        require(votes[voteID].voteID != 0, "Vote does not exist");
        Vote storage vote = votes[voteID];
        uint voterIndex = vote.voterIndexMap[msg.sender];
        Voter storage voter = vote.voters[voterIndex - 1];

        require(voter.isRegistered, "Voter is not registered for this vote.");
        require(!voter.hasVoted, "Voter has already voted.");
        uint endVoteTime = vote.startVoteTime + vote.duration;
        require(block.timestamp >= vote.startVoteTime && block.timestamp <= endVoteTime, "Voting is not currently active.");
        require(vote.groupId == voter.groupId, "Voter is not part of the group for this vote.");

        voter.hasVoted = true;
        voter.voteIndex = optionIndex;

        votes[voteID].options[optionIndex].countOption++;
    }

    function getVote(uint voteID) public view returns (
        string memory voteName,
        uint voteID2,
        uint startVoteTime,
        uint duration,
        uint optionsCount,
        bool open
    ) {
        Vote storage vote = votes[voteID];
        return (
            vote.voteName,
            vote.voteID,
            vote.startVoteTime,
            vote.duration,
            vote.optionsCount,
            vote.open
        );
    }

    // New function to get vote results for both open and closed votes
    function getVoteResults() public view returns (
        uint[] memory openVoteIDs,
        uint[] memory openVoteCounts,
        uint[] memory closedVoteIDs,
        string[] memory closedVoteNames,
        string[][] memory closedOptionNames,
        uint[][] memory closedOptionCounts
    ) {
        uint openCount = 0;
        uint closedCount = 0;

        // Count the open and closed votes
        for (uint i = 1; i <= nextVoteID; i++) {
            if (votes[i].open) {
                openCount++;
            } else {
                closedCount++;
            }
        }

        // Initialize arrays based on the counts
        openVoteIDs = new uint[](openCount);
        openVoteCounts = new uint[](openCount);
        closedVoteIDs = new uint[](closedCount);
        closedVoteNames = new string[](closedCount);
        closedOptionNames = new string[][](closedCount);
        closedOptionCounts = new uint[][](closedCount);

        uint openIndex = 0;
        uint closedIndex = 0;

        // Populate the arrays with open and closed vote details
        for (uint i = 1; i <= nextVoteID; i++) {
            if (votes[i].open) {
                openVoteIDs[openIndex] = votes[i].voteID;
                openVoteCounts[openIndex] = getTotalVotes(votes[i].voteID);
                openIndex++;
            } else {
                closedVoteIDs[closedIndex] = votes[i].voteID;
                closedVoteNames[closedIndex] = votes[i].voteName;
                closedOptionNames[closedIndex] = new string[](votes[i].options.length);
                closedOptionCounts[closedIndex] = new uint[](votes[i].options.length);
                for (uint j = 0; j < votes[i].options.length; j++) {
                    closedOptionNames[closedIndex][j] = votes[i].options[j].optionName;
                    closedOptionCounts[closedIndex][j] = votes[i].options[j].countOption;
                }
                closedIndex++;
            }
        }

        return (openVoteIDs, openVoteCounts, closedVoteIDs, closedVoteNames, closedOptionNames, closedOptionCounts);
    }

    // Helper function to get total votes for a vote
    function getTotalVotes(uint voteID) public view returns (uint) {
        uint total = 0;
        for (uint i = 0; i < votes[voteID].options.length; i++) {
            total += votes[voteID].options[i].countOption;
        }
        return total;
    }

    function hasVoted(uint voteID, address userAddress) public view returns (bool) {
        Vote storage vote = votes[voteID];
        uint voterIndex = vote.voterIndexMap[userAddress];
        if (voterIndex == 0) {
            return false;
        }
        Voter storage voter = vote.voters[voterIndex - 1];
        return voter.hasVoted;
    }
}
