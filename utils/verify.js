const { run } = require("hardhat")

const verify = async (contractAddress, args) => {
    console.log("Verification Contract")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (error) {
        if (error.message.toLowerCase().includes("already verified")) {
            console.log(error.message)
        } else {
            console.log(error)
        }
    }
}

module.exports = { verify }
