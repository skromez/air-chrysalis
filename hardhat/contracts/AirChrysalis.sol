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
        bool prizeSent;
    }
    struct RequestGiveaway {
        address accountAddress;
        uint256 giveawayId;
    }
    uint256 internal giveawayId = 1;
    mapping (address => uint256[]) addressGiveaways;
    mapping (address => mapping (uint256 => Giveaway)) giveawaysMap;
    mapping (uint256 => mapping(address => bool)) giveawayParticipants;
    mapping (uint256 => RequestGiveaway) requestToGiveaway;

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
        for (uint256 idx = 0; idx < _tokensTuple.length; idx++) {
            ERC1155 token = ERC1155(_contractAddr);
            require(token.balanceOf(msg.sender, _tokensTuple[idx][0]) > 0, "caller must own given token");
            require(token.balanceOf(msg.sender, _tokensTuple[idx][0]) >= _tokensTuple[idx][1], "caller must have specified amount of token");
        }
        addressGiveaways[msg.sender].push(giveawayId);
        address[] memory participants;
        giveawaysMap[msg.sender][giveawayId] = Giveaway(_contractAddr, _tokensTuple, participants, false, address(0), false);
        emit GiveawayCreated(msg.sender, giveawayId);
        giveawayId++;
    }

    function getAccountGiveaways(address account) public view returns(uint256[] memory) {
        return addressGiveaways[account];
    }

    function getAccountGiveaway(address account, uint256 _giveawayId) public view returns(Giveaway memory) {
        return giveawaysMap[account][_giveawayId];
    }

    function isParticipatingInGiveaway(address account, uint256 _giveawayId) public view returns(bool) {
        return giveawayParticipants[_giveawayId][account];
    }

    function enterGiveaway(address account, uint256 _giveawayId) public {
        require(account != msg.sender, "owner of giveaway can't participate");
        require(giveawaysMap[account][_giveawayId].finished == false, "giveaway ended");
        require(giveawaysMap[account][_giveawayId].contractAddr != address(0), "giveaway with specified id doesn't exist");
        require(giveawayParticipants[_giveawayId][msg.sender] == false, "can't enroll twice to the same giveaway");
        giveawayParticipants[_giveawayId][msg.sender] = true;
        giveawaysMap[account][_giveawayId].participants.push(msg.sender);
        emit GiveawayEntered(account, msg.sender, _giveawayId);
    }

    function finishGiveaway(address account, uint256 _giveawayId) public {
        require(msg.sender == account, "only host of giveaway can finish it");
        Giveaway storage _giveaway = giveawaysMap[account][_giveawayId];
        if (_giveaway.participants.length > 0) {
            s_requestId = COORDINATOR.requestRandomWords(
                s_keyHash,
                s_subscriptionId,
                s_requestConfirmations,
                s_callbackGasLimit,
                s_numWords
            );
            requestToGiveaway[s_requestId] = RequestGiveaway(account, _giveawayId);
            emit RandomizingGiveawayWinner(s_requestId, account, _giveawayId);
        } else {
            _giveaway.winner = address(0);
            _giveaway.finished = true;
            emit GiveawayCanceled(account, _giveawayId);
        }
    }

    function prizeSent(address account, uint256 _giveawayId) public {
        Giveaway storage _giveaway = giveawaysMap[account][_giveawayId];
        require(_giveaway.finished == true, "giveaway is not finished");
        require(msg.sender == account, "only host of giveaway can call prizeSent");
        require(_giveaway.winner != address(0), "winner should not be address zero");
        _giveaway.prizeSent = true;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        RequestGiveaway memory giveawayInfo = requestToGiveaway[requestId];
        Giveaway storage _giveaway = giveawaysMap[giveawayInfo.accountAddress][giveawayInfo.giveawayId];
        uint256 winnerIndex = (randomWords[0] % _giveaway.participants.length);
        _giveaway.winner = _giveaway.participants[winnerIndex];
        _giveaway.finished = true;
        emit GiveawayWinnerVerified(_giveaway.winner, giveawayInfo.giveawayId);
    }
}
