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
    uint32 immutable s_callbackGasLimit = 70000;
    uint16 immutable s_requestConfirmations = 3;

    uint256[] public s_randomWords;
    uint256 public s_requestId;

    struct Giveaway {
        address contractAddr;
        uint256[2][] tokensTuple;
        address[] participants;
        bool finished;
        uint32 winnersAmount;
        address owner;
        uint256 requestId;
        uint256[] randomWords;
    }

    struct RequestToGiveaway {
        address addr;
        uint256 giveawayId;
    }

    mapping (address => Giveaway[]) addressToGiveaways;
    mapping (uint256 => mapping(address => bool)) giveawayParticipants;
    mapping (uint256 => RequestToGiveaway) requestToGiveaway;

    event GiveawayCreated(address indexed account, uint256 giveawayId);
    event GiveawayEntered(address indexed account, address indexed participant, uint256 giveawayId);
    event GiveawayCanceled(address indexed account, uint256 giveawayId);

    event RandomizingGiveawayWinner(uint256 indexed requestId, address indexed account, uint256 indexed giveawayId);
    event GiveawayWinnersVerified(uint256[] randomWords, uint256 indexed giveawayId);

    constructor(
        uint64 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash
    ) VRFConsumerBaseV2(vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinator);
        s_keyHash = keyHash;
        s_subscriptionId = subscriptionId;
    }

    function createGiveaway(address _contractAddr, uint256[2][] memory _tokensTuple, uint32 winnersAmount) public {
        if (winnersAmount > 1) {
            require(_tokensTuple.length % winnersAmount == 0, "amount of items should be divided to winners amount without remainder");
        }
        addressToGiveaways[msg.sender].push(Giveaway(_contractAddr, _tokensTuple, new address[](0), false, winnersAmount, msg.sender, 0, new uint256[](0)));
        emit GiveawayCreated(msg.sender, addressToGiveaways[msg.sender].length);
    }

    function getAccountGiveaways(address account) public view returns(Giveaway[] memory) {
        return addressToGiveaways[account];
    }

    function isParticipatingInGiveaway(address account, uint256 _giveawayId) public view returns(bool) {
        return giveawayParticipants[_giveawayId][account];
    }

    function enterGiveaway(address addr, uint256 giveawayId) public {
        require(giveawayId + 1 <= addressToGiveaways[addr].length, "giveaway with specified index doesn't exist");
        Giveaway memory giveaway = addressToGiveaways[addr][giveawayId];
        require(giveaway.owner != msg.sender, "owner of giveaway can't participate");
        require(giveaway.finished == false, "giveaway ended");
        require(giveawayParticipants[giveawayId][msg.sender] == false, "can't enroll twice to the same giveaway");
        giveawayParticipants[giveawayId][msg.sender] = true;
        addressToGiveaways[addr][giveawayId].participants.push(msg.sender);
        emit GiveawayEntered(giveaway.owner, msg.sender, giveawayId);
    }

    function finishGiveaway(address addr, uint256 giveawayId) public {
        Giveaway storage giveaway = addressToGiveaways[addr][giveawayId];
        require(msg.sender == giveaway.owner, "only host of giveaway can finish it");
        if (giveaway.participants.length > 0) {
            s_requestId = COORDINATOR.requestRandomWords(
                s_keyHash,
                s_subscriptionId,
                s_requestConfirmations,
                s_callbackGasLimit * giveaway.winnersAmount,
                giveaway.winnersAmount
            );
            requestToGiveaway[s_requestId] = RequestToGiveaway(addr, giveawayId);
            giveaway.requestId = s_requestId;
            emit RandomizingGiveawayWinner(s_requestId, giveaway.owner, giveawayId);
        } else {
            giveaway.finished = true;
            emit GiveawayCanceled(giveaway.owner, giveawayId);
        }
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        RequestToGiveaway memory giveawayInfo = requestToGiveaway[requestId];

        addressToGiveaways[giveawayInfo.addr][giveawayInfo.giveawayId].finished = true;
        addressToGiveaways[giveawayInfo.addr][giveawayInfo.giveawayId].randomWords = randomWords;
        emit GiveawayWinnersVerified(randomWords, giveawayInfo.giveawayId);
    }
}
