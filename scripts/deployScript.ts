import hardhat from "hardhat";

async function main() {
    console.log("deploy start")

    const VBTCAddress = "0x84e7ae4897b3847b67f212aff78bfbc5f700aa40";

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
