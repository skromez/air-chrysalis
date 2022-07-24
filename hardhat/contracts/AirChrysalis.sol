// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

contract AirChrysalis is VRFConsumerBaseV2 {
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 immutable s_subscriptionId;
    bytes32 immutable s_keyHash;
    uint32 immutable s_callbackGasLimit = 40000;
    uint16 immutable s_requestConfirmations = 3;
    uint32 immutable s_numWords = 2;

    uint256[] public s_randomWords;
    uint256 public s_requestId;

    struct Giveaway {
        address contractAddr;
        uint256[2][] tokensTuple;
        address[] participants;
        bool finished;
        address winner;
        address owner;
        uint256 requestId;
    }
    Giveaway[] giveaways;

    mapping (address => uint256[]) addressGiveaways;
    mapping (uint256 => mapping(address => bool)) giveawayParticipants;
    mapping (uint256 => uint256) requestToGiveaway;

    event GiveawayCreated(address indexed account, uint256 giveawayId);
    event GiveawayEntered(address indexed account, address indexed participant, uint256 giveawayId);
    event GiveawayCanceled(address indexed account, uint256 giveawayId);

    event RandomizingGiveawayWinner(uint256 indexed requestId, address indexed account, uint256 indexed giveawayId);
    event GiveawayWinnerVerified(address indexed winnerAddress, uint256 indexed giveawayId);

    constructor(
        uint64 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash
    ) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_keyHash = keyHash;
        s_subscriptionId = subscriptionId;
    }

    function createGiveaway(address _contractAddr, uint256[2][] memory _tokensTuple) public {
        address[] memory participants;
        giveaways.push(Giveaway(_contractAddr, _tokensTuple, participants, false, address(0), msg.sender, 0));
        addressGiveaways[msg.sender].push(giveaways.length);
        emit GiveawayCreated(msg.sender, giveaways.length);
    }

    function getAccountGiveaways(address account) public view returns(uint256[] memory) {
        return addressGiveaways[account];
    }

    function getGiveaway(uint256 giveawayId) public view returns(Giveaway memory) {
        return giveaways[giveawayId];
    }

    function isParticipatingInGiveaway(address account, uint256 _giveawayId) public view returns(bool) {
        return giveawayParticipants[_giveawayId][account];
    }

    function enterGiveaway(uint256 giveawayId) public {
        require(giveawayId + 1 <= giveaways.length, "giveaway with specified index doesn't exist");
        Giveaway memory giveaway = giveaways[giveawayId];
        require(giveaway.owner != msg.sender, "owner of giveaway can't participate");
        require(giveaway.finished == false, "giveaway ended");
        require(giveawayParticipants[giveawayId][msg.sender] == false, "can't enroll twice to the same giveaway");
        giveawayParticipants[giveawayId][msg.sender] = true;
        giveaways[giveawayId].participants.push(msg.sender);
        emit GiveawayEntered(giveaway.owner, msg.sender, giveawayId);
    }

    function finishGiveaway(uint256 giveawayId) public {
        Giveaway storage giveaway = giveaways[giveawayId];
        require(msg.sender == giveaway.owner, "only host of giveaway can finish it");
        if (giveaway.participants.length > 0) {
            s_requestId = COORDINATOR.requestRandomWords(
                s_keyHash,
                s_subscriptionId,
                s_requestConfirmations,
                s_callbackGasLimit,
                s_numWords
            );
            requestToGiveaway[s_requestId] = giveawayId;
            giveaway.requestId = s_requestId;
            emit RandomizingGiveawayWinner(s_requestId, giveaway.owner, giveawayId);
        } else {
            giveaway.winner = address(0);
            giveaway.finished = true;
            emit GiveawayCanceled(giveaway.owner, giveawayId);
        }
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        uint256 giveawayId = requestToGiveaway[requestId];
        Giveaway storage giveaway = giveaways[giveawayId];
        uint256 winnerIndex = (randomWords[0] % giveaway.participants.length);
        giveaway.winner = giveaway.participants[winnerIndex];
        giveaway.finished = true;
        emit GiveawayWinnerVerified(giveaway.winner, giveawayId);
    }
}
