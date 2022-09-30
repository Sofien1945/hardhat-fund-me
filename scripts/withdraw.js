const { network, ethers, getNamedAccounts } = require("hardhat")

const main = async () => {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    const sendValue = ethers.utils.parseEther("0.1")

    console.log(`Constract Deployed at: ${fundMe.address}`)

    const transcationTxResponse = await fundMe.fund({ value: sendValue })
    await transcationTxResponse.wait(1)
    console.log(`Contract Funded with: ${sendValue}`)
    console.log("Call withdraw function")
    const transcationRxResponse = await fundMe.withdraw()
    await transcationRxResponse.wait(1)
    console.log(
        `Withdraw done balance: ${await fundMe.provider.getBalance(
            fundMe.address
        )}`
    )
}

main()
    .then(() => process.exit(0))
    .catch((e) => {
        console.log(e)
        process.exit(1)
    })
