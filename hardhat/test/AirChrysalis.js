const { assert, expect } = require("chai")
const { deployments, ethers } = require("hardhat")

describe("AirChrysalis Unit Tests", async function () {
  let airChrysalis, vrfCoordinatorV2Mock, nftContract, deployer, addr1, addr2;

  beforeEach(async () => {
    [deployer, addr1, addr2] = await ethers.getSigners();
    await deployments.fixture(["mocks", "vrf"]);
    nftContract = await ethers.getContract("NftContractMock");
    airChrysalis = await ethers.getContract("AirChrysalis");
    vrfCoordinatorV2Mock = await ethers.getContract("VRFCoordinatorV2Mock");
  });

  it("Should successfully create giveaway", async () => {
    await expect(airChrysalis.createGiveaway(nftContract.address, [[1, 100]])).to.emit(
        airChrysalis,
      "GiveawayCreated"
    ).withArgs(deployer.address, 1);
  });

  it("Should successfully return correct giveaways list for given account", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 100]])
    let giveawaysList = await airChrysalis.getAccountGiveaways(deployer.address)
    assert.equal(giveawaysList.length, 1, 'length should be 1')
    assert.equal(giveawaysList[0].toNumber(), 1, 'giveawayId should be 1')
  });

  it("Should successfully return giveaway by given giveawayId", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 100]])
    const giveaway = await airChrysalis.getGiveaway(0)
    assert.containsAllKeys(giveaway, ['contractAddr', 'tokensTuple', 'participants', 'finished', 'winner', 'owner', 'requestId'], 'should contain all Giveaway struct fields')
    assert.equal(giveaway.contractAddr, nftContract.address, 'contract address should be equal to nft address')
    assert.equal(giveaway.finished, false, 'giveaway should not be finished')
    assert.equal(giveaway.owner, deployer.address, 'owner address should equal deployer address')
    assert.equal(giveaway.winner, ethers.constants.AddressZero, 'winner should be empty');
    assert.equal(giveaway.requestId, 0, 'requestId should be 0');
    assert.equal(giveaway.participants.length, 0, 'participants should be empty');
    assert.equal(giveaway.tokensTuple[0][0].toNumber(), 1, 'tokenId should be equal to 1');
    assert.equal(giveaway.tokensTuple[0][1].toNumber(), 100, 'tokenAmount should be equal to 100');
  });

  it("Should not let to enter giveaway which doesn't exist", async () => {
    await expect(airChrysalis.connect(addr1).enterGiveaway(0))
      .to.be.revertedWith("giveaway with specified index doesn't exist");
  });

  it("Should not let owner of giveaway to participate in it", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]])
      await expect(airChrysalis.enterGiveaway(0))
          .to.be.revertedWith("owner of giveaway can't participate");
  });

  it("Should not let to enter giveaway if it's finished", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
    await airChrysalis.connect(addr1).enterGiveaway(0);
    await airChrysalis.finishGiveaway(0);
    const requestId = await airChrysalis.s_requestId()
    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, airChrysalis.address)
    await expect(airChrysalis.connect(addr2).enterGiveaway(0))
      .to.revertedWith('giveaway ended');
  });

  it("Should not let to enter giveaway twice", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
    await airChrysalis.connect(addr1).enterGiveaway(0);
    await expect(airChrysalis.connect(addr1).enterGiveaway(0))
      .to.be.revertedWith("can't enroll twice to the same giveaway");
  });

  it("Should let to enter giveaway which exist", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
    await expect(airChrysalis.connect(addr1).enterGiveaway(0)).to.emit(
      airChrysalis,
      "GiveawayEntered"
    ).withArgs(deployer.address, addr1.address, 0);
  });

  it("Should be able to cancel giveaway", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
    await expect(airChrysalis.finishGiveaway(0))
      .to.emit(airChrysalis, 'GiveawayCanceled').withArgs(deployer.address, 0)
    const giveaway = await airChrysalis.getGiveaway(0)
    assert.equal(giveaway.winner, ethers.constants.AddressZero, 'winner should be zero address');
    assert.equal(giveaway.finished, true, 'giveaway should be finished');
  });

  it("Should be able to finish giveaway", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
    await airChrysalis.connect(addr1).enterGiveaway(0);
    await expect(airChrysalis.finishGiveaway(0))
        .to.emit(airChrysalis, 'RandomizingGiveawayWinner')
    const requestId = await airChrysalis.s_requestId()
    await expect(
        vrfCoordinatorV2Mock.fulfillRandomWords(requestId, airChrysalis.address)
    ).to.emit(airChrysalis, "GiveawayWinnerVerified")
    const giveaway = await airChrysalis.getGiveaway(0)
    assert.equal(giveaway.winner, addr1.address, 'winner should be equal to addr1');
    assert.equal(giveaway.finished, true, 'giveaway should be finished');
  });

  it("Should not be able to finish giveaway if called by not host", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      await expect(airChrysalis.connect(addr1).finishGiveaway(0)).to.be.revertedWith('only host of giveaway can finish it');
  });

  it("Should successfully return boolean if account participating or not", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      let result = await airChrysalis.connect(addr1).isParticipatingInGiveaway(addr1.address, 0);
      assert.equal(result, false, 'account is not participating in the giveaway')
      await airChrysalis.connect(addr1).enterGiveaway(0);
      result = await airChrysalis.connect(addr1).isParticipatingInGiveaway(addr1.address, 0);
      assert.equal(result, true, 'account is participating in the giveaway')
  });
})
