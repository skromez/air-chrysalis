const { network } = require("hardhat")

const POINT_ONE_LINK = "100000000000000000"

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId
  // If we are on a local development network, we need to deploy mocks!
  if (chainId == 31337) {
    log("Local network detected! Deploying mocks...")
    await deploy("LinkToken", { from: deployer, log: true })
    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      log: true,
      args: [
        POINT_ONE_LINK,
        1e9, // 0.000000001 LINK per gas
      ],
    })
    await deploy("NftContractMock", {
        from: deployer,
        log: true,
        args: [],
    })
    log("Mocks Deployed!")
    log("----------------------------------------------------")
    log("You are deploying to a local network, you'll need a local network running to interact")
    log("Please run `yarn hardhat console` to interact with the deployed smart contracts!")
    log("----------------------------------------------------")
  }
}
module.exports.tags = ["all", "mocks", "main"]
