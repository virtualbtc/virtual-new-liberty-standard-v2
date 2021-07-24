import { BigNumber } from "@ethersproject/bignumber";
import { expect } from "chai";
import { waffle } from "hardhat";
import VNLSSellOrderBookArtifact from "../artifacts/contracts/VNLSSellOrderBook.sol/VNLSSellOrderBook.json";
import VirtualBitcoinArtifact from "../artifacts/contracts/test/VirtualBitcoin.sol/VirtualBitcoin.json";
import { VirtualBitcoin } from "../typechain/VirtualBitcoin";
import { VNLSSellOrderBook } from "../typechain/VNLSSellOrderBook";
import { expandTo18Decimals, expandTo8Decimals } from "./shared/utils/number";

const { deployContract } = waffle;

describe("VNLSSellOrderBook", () => {
    let vbtc: VirtualBitcoin;
    let sellOrderBook: VNLSSellOrderBook;

    const provider = waffle.provider;
    const [admin, other] = provider.getWallets();

    beforeEach(async () => {
        vbtc = await deployContract(
            admin,
            VirtualBitcoinArtifact,
            []
        ) as VirtualBitcoin;
        sellOrderBook = await deployContract(
            admin,
            VNLSSellOrderBookArtifact,
            [vbtc.address]
        ) as VNLSSellOrderBook;
    })

    context("new VNLSSellOrderBook", async () => {
        it("sell", async () => {
            const value = expandTo8Decimals(100)
            const price = expandTo18Decimals(1)
            await vbtc.connect(admin).testMint();
            await vbtc.approve(sellOrderBook.address, value);
            await expect(sellOrderBook.sell(value, price))
                .to.emit(sellOrderBook, "Sell")
                .withArgs(0, admin.address, value, price)
            expect(await sellOrderBook.get(0)).to.deep.eq([admin.address, value, price])
            expect(await sellOrderBook.count()).to.eq(1)
        })

        it("buy all", async () => {

            const value = expandTo8Decimals(100)
            const price = expandTo18Decimals(1)
            await vbtc.connect(admin).testMint();
            await vbtc.approve(sellOrderBook.address, value);
            await expect(sellOrderBook.sell(value, price))
                .to.emit(sellOrderBook, "Sell")
                .withArgs(0, admin.address, value, price)
            expect(await sellOrderBook.get(0)).to.deep.eq([admin.address, value, price])
            expect(await sellOrderBook.count()).to.eq(1)

            await expect(sellOrderBook.connect(other).buy(0, { value: expandTo18Decimals(1) }))
                .to.emit(sellOrderBook, "Buy")
                .withArgs(0, other.address, expandTo8Decimals(100))
                .to.emit(sellOrderBook, "Remove")
                .withArgs(0)
            expect(await sellOrderBook.get(0)).to.deep.eq(["0x0000000000000000000000000000000000000000", BigNumber.from(0), BigNumber.from(0)])

            expect(await vbtc.balanceOf(other.address)).to.eq(value)
        })

        it("buy some", async () => {

            const value = expandTo8Decimals(100)
            const price = expandTo18Decimals(2)
            await vbtc.connect(admin).testMint();
            await vbtc.approve(sellOrderBook.address, value);
            await expect(sellOrderBook.sell(value, price))
                .to.emit(sellOrderBook, "Sell")
                .withArgs(0, admin.address, value, price)
            expect(await sellOrderBook.get(0)).to.deep.eq([admin.address, value, price])
            expect(await sellOrderBook.count()).to.eq(1)

            await expect(sellOrderBook.connect(other).buy(0, { value: expandTo18Decimals(1) }))
                .to.emit(sellOrderBook, "Buy")
                .withArgs(0, other.address, expandTo8Decimals(50))
            expect(await sellOrderBook.get(0)).to.deep.eq([admin.address, value.div(2), price.div(2)])

            expect(await vbtc.balanceOf(other.address)).to.eq(value.div(2))

            await expect(sellOrderBook.connect(other).buy(0, { value: expandTo18Decimals(1) }))
                .to.emit(sellOrderBook, "Buy")
                .withArgs(0, other.address, expandTo8Decimals(50))
                .to.emit(sellOrderBook, "Remove")
                .withArgs(0)
            expect(await sellOrderBook.get(0)).to.deep.eq(["0x0000000000000000000000000000000000000000", BigNumber.from(0), BigNumber.from(0)])

            expect(await vbtc.balanceOf(other.address)).to.eq(value)
        })

        it("cancel", async () => {
            const value = expandTo8Decimals(100)
            const price = expandTo18Decimals(1)
            await vbtc.connect(admin).testMint();
            await vbtc.approve(sellOrderBook.address, value);
            await expect(sellOrderBook.sell(value, price))
                .to.emit(sellOrderBook, "Sell")
                .withArgs(0, admin.address, value, price)
            expect(await sellOrderBook.get(0)).to.deep.eq([admin.address, value, price])
            expect(await sellOrderBook.count()).to.eq(1)

            await expect(sellOrderBook.cancel(0))
                .to.emit(sellOrderBook, "Cancel")
                .withArgs(0)
            expect(await sellOrderBook.get(0)).to.deep.eq(["0x0000000000000000000000000000000000000000", BigNumber.from(0), BigNumber.from(0)])

            await expect(sellOrderBook.connect(other).buy(0, { value: expandTo18Decimals(1) })).to.be.reverted
        })
    })
})