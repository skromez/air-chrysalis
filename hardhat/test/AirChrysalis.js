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

  it("Should fail creating giveaway: can't split items between winners evenly #1", async () => {
    await expect(airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 2))
      .to.be.revertedWith('amount of items should be divided to winners amount without remainder');
  });

  it("Should fail creating giveaway: can't split items between winners evenly #2", async () => {
    await expect(airChrysalis.createGiveaway(nftContract.address, [[1, 1], [2, 1], [3, 1], [4, 1]], 3))
      .to.be.revertedWith('amount of items should be divided to winners amount without remainder');
  });


  it("Should successfully create giveaway and be able to split items evenly #1", async () => {
    await expect(airChrysalis.createGiveaway(nftContract.address, [[1, 1], [2, 1], [3, 1], [4, 1]], 2)).to.emit(
      airChrysalis,
      "GiveawayCreated"
    ).withArgs(deployer.address, 0);
  });

  it("Should successfully create giveaway and be able to split items evenly #2", async () => {
    await expect(airChrysalis.createGiveaway(nftContract.address, [[1, 1], [2, 1], [3, 1], [4, 1]], 4)).to.emit(
      airChrysalis,
      "GiveawayCreated"
    ).withArgs(deployer.address, 0);
  });

  it("Should successfully create giveaway for 1 winner", async () => {
    await expect(airChrysalis.createGiveaway(nftContract.address, [[1, 1], [2, 1], [3, 1], [4, 1]], 1)).to.emit(
        airChrysalis,
      "GiveawayCreated"
    ).withArgs(deployer.address, 0);
  });

  it("Should successfully return correct giveaways for given account", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1)
    const giveaways = await airChrysalis.getAccountGiveaways(deployer.address)
    assert.equal(giveaways.length, 1, 'length should be 1')
  });

  it("Should successfully return giveaway by given giveawayId", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 1], [2, 1]], 2)
    const [giveaway] = await airChrysalis.getAccountGiveaways(deployer.address)
    assert.containsAllKeys(giveaway, ['contractAddr', 'tokensTuple', 'participants', 'finished', 'winnersAmount', 'owner', 'requestId', 'randomNumber', 'prizeSent'], 'should contain all Giveaway struct fields')
    assert.equal(giveaway.contractAddr, nftContract.address, 'contract address should be equal to nft address')
    assert.equal(giveaway.finished, false, 'giveaway should not be finished')
    assert.equal(giveaway.owner, deployer.address, 'owner address should equal deployer address')
    assert.equal(giveaway.winnersAmount, 2, 'winners amount should be 1');
    assert.equal(giveaway.randomNumber, 0, 'randomNumber should be equal zero');
    assert.equal(giveaway.requestId, 0, 'requestId should be 0');
    assert.equal(giveaway.prizeSent, false, 'prizeSent should be false');
    assert.equal(giveaway.participants.length, 0, 'participants should be empty');
    assert.equal(giveaway.tokensTuple[0][0].toNumber(), 1, 'tokenId should be equal to 1');
    assert.equal(giveaway.tokensTuple[0][1].toNumber(), 1, 'tokenAmount should be equal to 100');
  });

  it("Should not let to enter giveaway which doesn't exist", async () => {
    await expect(airChrysalis.connect(addr1).enterGiveaway(deployer.address, 0))
      .to.be.revertedWith("giveaway with specified index doesn't exist");
  });

  it("Should not let owner of giveaway to participate in it", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1)
      await expect(airChrysalis.enterGiveaway(deployer.address, 0))
          .to.be.revertedWith("owner of giveaway can't participate");
  });

  it("Should not let to enter giveaway if it's finished", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1);
    await airChrysalis.connect(addr1).enterGiveaway(deployer.address, 0);
    await airChrysalis.finishGiveaway(deployer.address, 0);
    const requestId = await airChrysalis.s_requestId()
    await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, airChrysalis.address)
    await expect(airChrysalis.connect(addr2).enterGiveaway(deployer.address, 0))
      .to.revertedWith('giveaway ended');
  });

  it("Should not let to enter giveaway twice", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1);
    await airChrysalis.connect(addr1).enterGiveaway(deployer.address, 0);
    await expect(airChrysalis.connect(addr1).enterGiveaway(deployer.address, 0))
      .to.be.revertedWith("can't enroll twice to the same giveaway");
  });

  it("Should let to enter giveaway which exist", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1);
    await expect(airChrysalis.connect(addr1).enterGiveaway(deployer.address, 0)).to.emit(
      airChrysalis,
      "GiveawayEntered"
    ).withArgs(deployer.address, addr1.address, 0);
  });

  it("Should be able to cancel giveaway", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1);
    await expect(airChrysalis.finishGiveaway(deployer.address, 0))
      .to.emit(airChrysalis, 'GiveawayCanceled').withArgs(deployer.address, 0)
    const [giveaway] = await airChrysalis.getAccountGiveaways(deployer.address)
    assert.equal(giveaway.randomNumber, 0, `giveaway's random number should be 0`);
    assert.equal(giveaway.finished, true, 'giveaway should be finished');
  });

  it("Should cancel giveaway if there's not enough participants", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 3]], 3);
    await airChrysalis.connect(addr1).enterGiveaway(deployer.address, 0);
    await expect(airChrysalis.finishGiveaway(deployer.address, 0))
      .to.emit(airChrysalis, 'GiveawayCanceled').withArgs(deployer.address, 0)
    const [giveaway] = await airChrysalis.getAccountGiveaways(deployer.address)
    assert.equal(giveaway.randomNumber, 0, `giveaway's random number should be 0`);
    assert.equal(giveaway.finished, true, 'giveaway should be finished');
  });

  it("Should be able to finish giveaway", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1);
    await airChrysalis.connect(addr1).enterGiveaway(deployer.address, 0);
    await expect(airChrysalis.finishGiveaway(deployer.address, 0))
        .to.emit(airChrysalis, 'RandomizingGiveawayWinner')
    const requestId = await airChrysalis.s_requestId()
    await expect(
        vrfCoordinatorV2Mock.fulfillRandomWords(requestId, airChrysalis.address)
    ).to.emit(airChrysalis, "GiveawayWinnersVerified")
    const [giveaway] = await airChrysalis.getAccountGiveaways(deployer.address)
    assert.equal(giveaway.randomNumber.toString(), '78541660797044910968829902406342334108369226379826116161446442989268089806461', 'random numbers should have 1 number');
    assert.equal(giveaway.finished, true, 'giveaway should be finished');
  });

  it("Should not be able to finish giveaway if called by not host", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1);
      await expect(airChrysalis.connect(addr1).finishGiveaway(deployer.address, 0)).to.be.revertedWith('only host of giveaway can finish it');
  });

  it("Should not be able to call PrizeSent because giveaway is not finished", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1);
    await expect(airChrysalis.prizeSent(deployer.address, 0))
      .to.be.revertedWith("can't call prizeSent, giveaway is not finished");
  });

  it("Should not be able to call PrizeSent if called by not host", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1);
    await airChrysalis.finishGiveaway(deployer.address, 0);
    await expect(airChrysalis.connect(addr1).prizeSent(deployer.address, 0))
      .to.be.revertedWith("only host of giveaway can call prizeSent");
  });

  it("Should be able to call PrizeSent after it's finished", async () => {
    await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1);
    await airChrysalis.finishGiveaway(deployer.address, 0);
    await airChrysalis.prizeSent(deployer.address, 0);
    const [giveaway] = await airChrysalis.getAccountGiveaways(deployer.address)
    assert.equal(giveaway.prizeSent, true, 'prizeSent is been called, should be equal true')
  });

  it("Should successfully return boolean if account participating or not", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 1]], 1);
      let result = await airChrysalis.connect(addr1).isParticipatingInGiveaway(addr1.address, 0);
      assert.equal(result, false, 'account is not participating in the giveaway')
      await airChrysalis.connect(addr1).enterGiveaway(deployer.address, 0);
      result = await airChrysalis.connect(addr1).isParticipatingInGiveaway(addr1.address, 0);
      assert.equal(result, true, 'account is participating in the giveaway')
  });
})
