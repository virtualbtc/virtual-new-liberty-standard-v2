import hardhat from "hardhat";

async function main() {
    console.log("deploy start")

    const VBTCAddress = "0xfe6D468bB4DD530E0f5eE98b58e37e11DaAAaF31";

    //const VNLSBuyOrderBook = await hardhat.ethers.getContractFactory("VNLSBuyOrderBook")
    //const buyOrderBook = await VNLSBuyOrderBook.deploy(VBTCAddress)
    //console.log(`VNLSBuyOrderBook address: ${buyOrderBook.address}`)

    const VNLSSellOrderBook = await hardhat.ethers.getContractFactory("VNLSSellOrderBook")
    const sellOrderBook = await VNLSSellOrderBook.deploy(VBTCAddress)
    console.log(`VNLSSellOrderBook address: ${sellOrderBook.address}`)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
