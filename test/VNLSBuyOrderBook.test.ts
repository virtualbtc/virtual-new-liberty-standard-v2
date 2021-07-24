import { expect } from "chai";
import { BigNumber } from "ethers";
import { waffle } from "hardhat";
import VNLSBuyOrderBookArtifact from "../artifacts/contracts/VNLSBuyOrderBook.sol/VNLSBuyOrderBook.json";
import VirtualBitcoinArtifact from "../artifacts/contracts/test/VirtualBitcoin.sol/VirtualBitcoin.json";
import { VNLSBuyOrderBook } from "../typechain/VNLSBuyOrderBook";
import { VirtualBitcoin } from "../typechain/VirtualBitcoin";
import { expandTo18Decimals, expandTo8Decimals } from "./shared/utils/number";

const { deployContract } = waffle;

describe("VNLSBuyOrderBook", () => {
    let vbtc: VirtualBitcoin;
    let buyOrderBook: VNLSBuyOrderBook;

    const provider = waffle.provider;
    const [admin, other] = provider.getWallets();

    beforeEach(async () => {
        vbtc = await deployContract(
            other,
            VirtualBitcoinArtifact,
            []
        ) as VirtualBitcoin;
        buyOrderBook = await deployContract(
            admin,
            VNLSBuyOrderBookArtifact,
            [vbtc.address]
        ) as VNLSBuyOrderBook;
    })

    context("new VNLSBuyOrderBook", async () => {
        it("buy", async () => {
            const value = expandTo8Decimals(100)
            const price = expandTo18Decimals(1)
            await expect(buyOrderBook.buy(value, { value: price }))
                .to.emit(buyOrderBook, "Buy")
                .withArgs(0, admin.address, value, price)
            expect(await buyOrderBook.get(0)).to.deep.eq([admin.address, value, price])
            expect(await buyOrderBook.count()).to.eq(1)
        })

        it("sell all", async () => {

            const value = expandTo8Decimals(100)
            const price = expandTo18Decimals(1)
            await expect(buyOrderBook.buy(value, { value: price }))
                .to.emit(buyOrderBook, "Buy")
                .withArgs(0, admin.address, value, price)
            expect(await buyOrderBook.get(0)).to.deep.eq([admin.address, value, price])
            expect(await buyOrderBook.count()).to.eq(1)

            await vbtc.connect(other).testMint();
            await vbtc.connect(other).approve(buyOrderBook.address, value);
            await expect(buyOrderBook.connect(other).sell(0, value))
                .to.emit(buyOrderBook, "Sell")
                .withArgs(0, other.address, value)
                .to.emit(buyOrderBook, "Remove")
                .withArgs(0)
            expect(await buyOrderBook.get(0)).to.deep.eq(["0x0000000000000000000000000000000000000000", BigNumber.from(0), BigNumber.from(0)])

            expect(await vbtc.balanceOf(admin.address)).to.eq(value)
        })

        it("sell some", async () => {

            const value = expandTo8Decimals(100)
            const price = expandTo18Decimals(2)
            await expect(buyOrderBook.buy(value, { value: price }))
                .to.emit(buyOrderBook, "Buy")
                .withArgs(0, admin.address, value, price)
            expect(await buyOrderBook.get(0)).to.deep.eq([admin.address, value, price])
            expect(await buyOrderBook.count()).to.eq(1)

            await vbtc.connect(other).testMint();
            await vbtc.connect(other).approve(buyOrderBook.address, value);

            await expect(buyOrderBook.connect(other).sell(0, expandTo8Decimals(50)))
                .to.emit(buyOrderBook, "Sell")
                .withArgs(0, other.address, expandTo8Decimals(50))
            expect(await buyOrderBook.get(0)).to.deep.eq([admin.address, value.div(2), price.div(2)])

            expect(await vbtc.balanceOf(admin.address)).to.eq(value.div(2))

            await expect(buyOrderBook.connect(other).sell(0, expandTo8Decimals(50)))
                .to.emit(buyOrderBook, "Sell")
                .withArgs(0, other.address, expandTo8Decimals(50))
                .to.emit(buyOrderBook, "Remove")
                .withArgs(0)
            expect(await buyOrderBook.get(0)).to.deep.eq(["0x0000000000000000000000000000000000000000", BigNumber.from(0), BigNumber.from(0)])

            expect(await vbtc.balanceOf(admin.address)).to.eq(value)
        })

        it("cancel", async () => {
            const value = expandTo8Decimals(100)
            const price = expandTo18Decimals(1)
            await expect(buyOrderBook.buy(value, { value: price }))
                .to.emit(buyOrderBook, "Buy")
                .withArgs(0, admin.address, value, price)
            expect(await buyOrderBook.get(0)).to.deep.eq([admin.address, value, price])
            expect(await buyOrderBook.count()).to.eq(1)

            await expect(buyOrderBook.cancel(0))
                .to.emit(buyOrderBook, "Cancel")
                .withArgs(0)
            expect(await buyOrderBook.get(0)).to.deep.eq(["0x0000000000000000000000000000000000000000", BigNumber.from(0), BigNumber.from(0)])

            await expect(buyOrderBook.connect(other).sell(0, value)).to.be.reverted
        })
    })
})