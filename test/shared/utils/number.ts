import { BigNumber } from "ethers";

export function expandTo8Decimals(n: number): BigNumber {
    return BigNumber.from(n).mul(BigNumber.from(10).pow(8));
}

export function expandTo18Decimals(n: number): BigNumber {
    return BigNumber.from(n).mul(BigNumber.from(10).pow(18));
}
