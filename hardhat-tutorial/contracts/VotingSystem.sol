// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract VotingSystem {

    struct Voter { //The data will be taken from the voter account 
        address addressVoter; 
        bool isRegistered; //if true, that person registered
        bool hasVoted; //if true, that person already voted
        uint voteIndex; //index of the voted proposal
        uint groupId; //group id of the voter
    }

    struct Option { 
        string optionName;
        uint countOption; // How many votes have this option
    }

    struct Group {
        uint groupId;
        string groupName;
    }

    struct Vote { //Data about the vote 
        string voteName; 
        uint voteID;
        uint startVoteTime; //contains the date when the contract is created
        uint endVoteTime; //contains the date when the contract expires
        mapping(uint => Option) options; //mapping of the vote options -> optionID => Option
        mapping(address => Voter) voters; // add here to ones that can vote
        uint groupId; // Add this to associate the vote with a specific group
        uint optionsCount;
    }

    modifier onlyAdmin{ //Calling specific functions for the admin
        require(msg.sender == admin,"Only the Administrator allowed make this action");
        _;
    }
    modifier onlyVoter{ //Calling specific functions for the voter
        require(msg.sender != admin,"Only the voter allowed make this action");
        _;
    }

    // ************************************ Global variables ************************************
    address admin; // the owner of the contract
    //Vote vote; // object Vote, save all the information of the vote to be voted in it
    mapping(uint => Vote) public votes; // Mapping of voteID to Vote ---> not sure
    // need to swap to votes 
    // ************************************ Constructor ****************************************************
    // initialize the data of the vote that we select to be voted 
    constructor(){
        admin = msg.sender; //the admin is the owner of the contract
    }

    //************************************ Functions ****************************************************
    // 1.addVoter - the admin only adds a new voter to the voting system (Vote struct). 
    //the function should receive as input the address of the new voter
    //function to add the voters to the vote
    //** initialize voters  -- need to fix ASAP
    // **** need to think what is the consicuenses that only the admin can call this function. how it can couse that new voters will add.
    function addVoter(uint voteID, address voterAddress, uint groupId) public onlyAdmin {
        //Voter memory voter;//creating a voter to be saved after in the data structure where all the voters are saved.
        require(block.timestamp < votes[voteID].endVoteTime, "Voting time has ended.");
        //checking if the data voter has bee initialized by the system
        require(votes[voteID].voters[voterAddress].isRegistered, "The voter exist already at the system.");
        //initializing the data of the new voter
        votes[voteID].voters[voterAddress] = Voter({
            addressVoter: voterAddress,
            isRegistered: true,
            hasVoted: false,
            voteIndex: 0,
            groupId: groupId // Set the voter's group
        });
    }

    //gets array of voters/group ID and create the vote using the votes variable 
    // Function to create a new vote
    function createVote(uint voteID, string memory voteName, uint startTime, uint duration, uint groupId, string[] memory voting_options) public onlyAdmin {
        // Initialize the vote data
        votes[voteID].voteID = voteID;
        votes[voteID].voteName = voteName;
        votes[voteID].startVoteTime = block.timestamp + startTime;
        votes[voteID].endVoteTime = votes[voteID].startVoteTime + duration;
        votes[voteID].groupId = groupId;
        votes[voteID].optionsCount = voting_options.length; // Set options count here

        
        // Initialize the options
        for(uint i = 0; i < voting_options.length; i++){
            votes[voteID].options[i] = Option(voting_options[i], 0);
        }
    }

    // 2.getVoteResults - either admin or voter can call this function. 
    //it will return the counter for each vote
    //Function to retrieve the vote results.
    //return An array of vote counts corresponding to each vote option.
    function getVoteResults(uint voteID, uint optionsCount) public view returns (uint[] memory) {
        uint[] memory voteCounts = new uint[](optionsCount); // Initialize with the actual number of options.
        // Iterate over each option in the vote and fetch its 'countOption'
        for (uint i = 0; i < optionsCount; i++) {
            voteCounts[i] = votes[voteID].options[i].countOption;
        }
        return voteCounts;
    }

    function getOptionsCount(uint voteID) public view returns (uint) {
        return votes[voteID].optionsCount; // Add optionsCount to your Vote struct
    }

    function getOptionDetails(uint voteID, uint optionIndex) public view returns (string memory optionName, uint countOption) {
            Option storage option = votes[voteID].options[optionIndex];
            return (option.optionName, option.countOption);
    }

    // function getVotesByUserGroup(address user) external view returns (Vote[] memory) {
    //     uint256 groupId = userGroup[user];
    //     uint256 count = 0;
    //     // First count relevant votes
    //     for (uint256 i = 1; i <= voteCount; i++) {
    //         if (votes[i].groupId == groupId) {
    //             count++;
    //         }
    //     }

    //     Vote[] memory groupVotes = new Vote[](count);
    //     uint256 index = 0;
    //     // Now store relevant votes
    //     for (uint256 i = 1; i <= voteCount; i++) {
    //         if (votes[i].groupId == groupId) {
    //             groupVotes[index] = votes[i];
    //             index++;
    //         }
    //     }
    //     return groupVotes;
    // }

    // Function for voters to cast their vote.
    // voteIndex - The index of the vote option chosen by the voter.
    function castVote(uint voteID, uint optionIndex) public {
        require(votes[voteID].voters[msg.sender].isRegistered, "Voter is not registered for this vote.");
        require(!votes[voteID].voters[msg.sender].hasVoted, "Voter has already voted.");
        require(block.timestamp >= votes[voteID].startVoteTime && block.timestamp <= votes[voteID].endVoteTime, "Voting is not currently active.");
        // check if the voter is part of the group for this vote
        require(votes[voteID].groupId == votes[voteID].voters[msg.sender].groupId, "Voter is not part of the group for this vote.");

        // Record the voter's choice
        votes[voteID].voters[msg.sender].hasVoted = true;
        votes[voteID].voters[msg.sender].voteIndex = optionIndex;

        // Increment the vote count for the chosen option
        votes[voteID].options[optionIndex].countOption+=1;
}
}