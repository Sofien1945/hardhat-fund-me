const { assert, expect } = require("chai")
const { network, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardat-config")

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe staging test", async () => {
          let deployer, fundMe
          const sendValue = ethers.utils.parseEther("1")

          beforeEach("Deploy fundMe contract...", async () => {
              deployer = (await getNamedAccounts()).deployer
              fundMe = await ethers.getContract("FundMe", deployer)
          })

          it("allows people to fund and withdraw", async () => {
              const fundTxResponse = await fundMe.fund({ value: sendValue })
              await fundTxResponse.wait(1)
              const withdrawTxResponse = await fundMe.withdraw()
              await withdrawTxResponse.wait(1)

              const endingFundMeBalance = await fundMe.provider.getBalance(
                  fundMe.address
              )
              assert.equal(endingFundMeBalance.toString(), "0")
          })
      })
