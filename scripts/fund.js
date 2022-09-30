const { network, ethers, getNamedAccounts } = require("hardhat")

const main = async () => {
    const { deployer } = await getNamedAccounts()
    const fundMe = await ethers.getContract("FundMe", deployer)
    const sendValue = ethers.utils.parseEther("0.1")

    console.log(`Constract Deployed at: ${fundMe.address}`)
    const transcationTxResponce = await fundMe.fund({ value: sendValue })
    await transcationTxResponce.wait(1)
    console.log(`Contract funded with: ${sendValue}`)
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
        process.exit(1)
    })
