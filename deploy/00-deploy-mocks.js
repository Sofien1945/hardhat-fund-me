const { network } = require("hardhat")
const { developmentChains } = require("../helper-hardat-config")

const DECIMALS = 8
const INITIAL_PRICE = "200000000000"

module.exports = async (hre) => {
    const { getNamedAccounts, deployments } = hre
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    if (developmentChains.includes(network.name)) {
        log("Local network... deploy mocks")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE],
        })
        log("*********************************************")
        log("Mocks Deployed!")
        log("------------------------------------------------")
        log(
            "You are deploying to a local network, you'll need a local network running to interact"
        )
        log(
            "Please run `npx hardhat console` to interact with the deployed smart contracts!"
        )
        log("------------------------------------------------")
    } else {
        console.log("FAILED TO DEPLOY")
    }
}

module.exports.tags = ["all", "mocks"]
