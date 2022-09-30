const { expect, assert } = require("chai")
const { network, deployments, ethers, getNamedAccounts } = require("hardhat")
const { developmentChains } = require("../../helper-hardat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe, deployer, mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1")

          beforeEach("Contract Deloy for testing", async () => {
              //Deploy our contract using harhat-deploy plugin
              //;[owner, addr1, addr2, _] = await ethers.getSigners()
              const namedAccount = await getNamedAccounts()
              deployer = namedAccount.deployer

              await deployments.fixture(["all"])
              fundMe = await ethers.getContract("FundMe")
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          describe("Constructor...", async () => {
              it("Set the aggregator address properly", async () => {
                  const response = await fundMe.getPriceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
              it("Should assign the correct owner", async () => {
                  const owner = await fundMe.getOwner()
                  expect(deployer).to.be.equal(owner)
              })
          })

          describe("Fund...", async () => {
              it("Fails id not enough TOKEN Sent", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more Money!!"
                  )
              })

              it("Should update the s_addressToAmountFunded data structure", async () => {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("add the funder address to the funder array", async () => {
                  await fundMe.fund({ value: sendValue, from: deployer })
                  const response = await fundMe.getFunders(0)
                  expect(response).to.be.equal(deployer)
              })
          })

          describe("Withdraw...", async () => {
              beforeEach("Fund the contract...", async () => {
                  await fundMe.fund({ value: sendValue, from: deployer })
              })

              it("withdraw TOKEN from single funder", async () => {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Check if the funds allready
                  const response = await fundMe.getTotalFunded()
                  expect(response.toString()).to.be.equal(
                      startingFundMeBalance.toString()
                  )
                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReciept = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReciept

                  //GasCost
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  expect(endingFundMeBalance).to.be.equal(0)
                  expect(
                      endingDeployerBalance.add(gasCost).toString()
                  ).to.be.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  )
              })

              it("allows fund and withdraw TOKEN from multiple accounts", async () => {
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 6; i++) {
                      fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReciept = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  //Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  expect(endingFundMeBalance).to.be.equal(0)
                  expect(
                      endingDeployerBalance.add(gasCost).toString()
                  ).to.be.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  )
                  expect(fundMe.getFunders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allows owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(
                      fundMeConnectContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })

          describe("Cheeper Withdraw...", async () => {
              beforeEach("Fund the contract...", async () => {
                  await fundMe.fund({ value: sendValue, from: deployer })
              })

              it("withdraw TOKEN from single funder", async () => {
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  //Check if the funds allready
                  const response = await fundMe.getTotalFunded()
                  expect(response.toString()).to.be.equal(
                      startingFundMeBalance.toString()
                  )
                  //Act
                  const transactionResponse = await fundMe.cheepWithdraw()
                  const transactionReciept = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReciept

                  //GasCost
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  expect(endingFundMeBalance).to.be.equal(0)
                  expect(
                      endingDeployerBalance.add(gasCost).toString()
                  ).to.be.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  )
              })

              it("allows fund and withdraw TOKEN from multiple accounts", async () => {
                  const accounts = await ethers.getSigners()
                  for (i = 1; i < 6; i++) {
                      fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //Act
                  const transactionResponse = await fundMe.cheepWithdraw()
                  const transactionReciept = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReciept
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  //Assert
                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  expect(endingFundMeBalance).to.be.equal(0)
                  expect(
                      endingDeployerBalance.add(gasCost).toString()
                  ).to.be.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString()
                  )
                  expect(fundMe.getFunders(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allows owner to withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const fundMeConnectContract = await fundMe.connect(
                      accounts[1]
                  )
                  await expect(
                      fundMeConnectContract.cheepWithdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner")
              })
          })
      })
