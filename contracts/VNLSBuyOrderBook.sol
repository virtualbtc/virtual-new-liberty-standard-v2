// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "./interfaces/IVNLSBuyOrderBook.sol";
import "./interfaces/IVirtualBitcoin.sol";

contract VNLSBuyOrderBook is IVNLSBuyOrderBook {
    
    IVirtualBitcoin vbtc;

    struct BuyOrder {
        address buyer;
        uint256 amount;
        uint256 price;
    }
    BuyOrder[] public orders;

    constructor(IVirtualBitcoin _vbtc) {
        vbtc = _vbtc;
    }

    function count() override external view returns (uint256) {
        return orders.length;
    }

    function get(uint256 orderId) override external view returns (address buyer, uint256 amount, uint256 price) {
        BuyOrder memory order = orders[orderId];
        return (order.buyer, order.amount, order.price);
    }

    function buy(uint256 amount) override payable external {
        uint256 orderId = orders.length;
        orders.push(BuyOrder({
            buyer: msg.sender,
            amount: amount,
            price: msg.value
        }));
        emit Buy(orderId, msg.sender, amount, msg.value);
    }

    function remove(uint256 orderId) internal {
        delete orders[orderId];
        emit Remove(orderId);
    }

    function sell(uint256 orderId, uint256 amount) override external {
        BuyOrder storage order = orders[orderId];
        uint256 price = order.price * amount / order.amount;
        vbtc.transferFrom(msg.sender, order.buyer, amount);
        order.amount -= amount;
        order.price -= price;
        if (order.amount == 0) {
            remove(orderId);
        }
        payable(msg.sender).transfer(price);
        emit Sell(orderId, msg.sender, amount);
    }

    function cancel(uint256 orderId) override external {
        BuyOrder memory order = orders[orderId];
        require(order.buyer == msg.sender);
        payable(msg.sender).transfer(order.price);
        remove(orderId);
        emit Cancel(orderId);
    }
}
