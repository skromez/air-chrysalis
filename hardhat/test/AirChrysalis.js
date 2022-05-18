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
      assert.equal(giveawaysList.length, 1, 'length should be 2')
      assert.equal(giveawaysList[0].toNumber(), 1, 'giveawayId should be 1')
  });

  it("Should successfully return giveaway by given giveawayId and address", async () => {
      let giveaway = await airChrysalis.getAccountGiveaway(deployer.address, 1)
      assert.containsAllKeys(giveaway, ['contractAddr', 'tokensTuple', 'participants', 'finished', 'winner', 'prizeSent'], 'should contain all Giveaway struct fields')
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]])
      giveaway = await airChrysalis.getAccountGiveaway(deployer.address, 1)
      assert.equal(giveaway.contractAddr, nftContract.address, 'contract address should be equal to nft address')
      assert.equal(giveaway.finished, false, 'giveaway should not be finished')
      assert.equal(giveaway.prizeSent, false, 'prizeSent should be false')
      assert.equal(giveaway.winner, ethers.constants.AddressZero, 'winner should be empty');
      assert.equal(giveaway.participants.length, 0, 'participants should be empty');
      assert.equal(giveaway.tokensTuple[0][0].toNumber(), 1, 'tokenId should be equal to 1');
      assert.equal(giveaway.tokensTuple[0][1].toNumber(), 100, 'tokenAmount should be equal to 100');
  });


  it("Should revert giveaway creation with 'caller must have specified amount of token'", async () => {
      await expect(airChrysalis.createGiveaway(nftContract.address, [[1, 1000]]))
          .to.be.revertedWith('caller must have specified amount of token');
  })

  it("Should revert giveaway creation with 'caller must own given token'", async () => {
      await expect(airChrysalis.connect(addr1).createGiveaway(nftContract.address, [[1, 1]]))
          .to.be.revertedWith('caller must own given token');
  });

  it("Should not let owner of giveaway to participate in it", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]])
      await expect(airChrysalis.enterGiveaway(deployer.address, 1))
          .to.be.revertedWith("owner of giveaway can't participate");
  });

  it("Should not let to enter giveaway if it's finished", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      await airChrysalis.connect(addr1).enterGiveaway(deployer.address, 1);
      await airChrysalis.finishGiveaway(deployer.address, 1);
      const requestId = await airChrysalis.s_requestId()
      await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, airChrysalis.address)
      await expect(airChrysalis.connect(addr2).enterGiveaway(deployer.address, 1))
          .to.revertedWith('giveaway ended');
  });

  it("Should not let to enter giveaway twice", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      await airChrysalis.connect(addr1).enterGiveaway(deployer.address, 1);
      await expect(airChrysalis.connect(addr1).enterGiveaway(deployer.address, 1))
          .to.be.revertedWith("can't enroll twice to the same giveaway");
  });

  it("Should not let to enter giveaway which doesn't exist", async () => {
      await expect(airChrysalis.connect(addr1).enterGiveaway(deployer.address, 1))
          .to.be.revertedWith("giveaway with specified id doesn't exist");
  });

  it("Should be able to cancel giveaway", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      await expect(airChrysalis.finishGiveaway(deployer.address, 1))
          .to.emit(airChrysalis, 'GiveawayCanceled').withArgs(deployer.address, 1)
      const giveaway = await airChrysalis.getAccountGiveaway(deployer.address, 1)
      assert.equal(giveaway.winner, ethers.constants.AddressZero, 'winner should be zero address');
      assert.equal(giveaway.finished, true, 'giveaway should be finished');
  });

  it("Should be able to finish giveaway", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      await airChrysalis.connect(addr1).enterGiveaway(deployer.address, 1);
      await expect(airChrysalis.finishGiveaway(deployer.address, 1))
          .to.emit(airChrysalis, 'RandomizingGiveawayWinner')
      const requestId = await airChrysalis.s_requestId()
      await expect(
          vrfCoordinatorV2Mock.fulfillRandomWords(requestId, airChrysalis.address)
      ).to.emit(airChrysalis, "GiveawayWinnerVerified")
      const giveaway = await airChrysalis.getAccountGiveaway(deployer.address, 1)
      assert.equal(giveaway.winner, addr1.address, 'winner should be equal to addr1');
      assert.equal(giveaway.finished, true, 'giveaway should be finished');
  });

  it("Should not be able to finish giveaway if called by not host", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      await expect(airChrysalis.connect(addr1).finishGiveaway(deployer.address, 1)).to.be.revertedWith('only host of giveaway can finish it');
  });

  it("Should be able to successfully call prizeSent", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      await airChrysalis.connect(addr1).enterGiveaway(deployer.address, 1);
      await airChrysalis.finishGiveaway(deployer.address, 1);
      const requestId = await airChrysalis.s_requestId();
      await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, airChrysalis.address);
      await airChrysalis.prizeSent(deployer.address, 1);
      const giveaway = await airChrysalis.getAccountGiveaway(deployer.address, 1);
      assert.equal(giveaway.prizeSent, true, 'prize sent should equal true');
  });

  it("Should revert call prizeSent with 'only host of giveaway can sent prize'", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      await airChrysalis.connect(addr1).enterGiveaway(deployer.address, 1);
      await airChrysalis.finishGiveaway(deployer.address, 1);
      const requestId = await airChrysalis.s_requestId();
      await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, airChrysalis.address);
      await expect(airChrysalis.connect(addr1).prizeSent(deployer.address, 1)).to.be.revertedWith('only host of giveaway can call prizeSent');
  });

  it("Should revert call prizeSent with 'giveaway is not finished'", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      await expect(airChrysalis.prizeSent(deployer.address, 1)).to.be.revertedWith('giveaway is not finished');
  });

  it("Should revert call prizeSent with 'winner should not be address zero'", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      await airChrysalis.finishGiveaway(deployer.address, 1);
      await expect(airChrysalis.prizeSent(deployer.address, 1)).to.be.revertedWith('winner should not be address zero');
  });

  it("Should successfully return boolean if account participating or not", async () => {
      await airChrysalis.createGiveaway(nftContract.address, [[1, 100]]);
      let result = await airChrysalis.connect(addr1).isParticipatingInGiveaway(addr1.address, 1);
      assert.equal(result, false, 'account is not participating in the giveaway')
      await airChrysalis.connect(addr1).enterGiveaway(deployer.address, 1);
      result = await airChrysalis.connect(addr1).isParticipatingInGiveaway(addr1.address, 1);
      assert.equal(result, true, 'account is participating in the giveaway')
  });
})
