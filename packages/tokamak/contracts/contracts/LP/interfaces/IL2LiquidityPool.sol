// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
pragma experimental ABIEncoderV2;

/**
 * @title IL2LiquidityPool
 */
interface IL2LiquidityPool {

    /********************
     *       Events     *
     ********************/

    event AddLiquidity(address sender, uint256 amount, address tokenAddress);

    event ClientDepositL2(address sender, uint256 receivedAmount, address tokenAddress);

    event ClientPayL2Settlement(
        address sender,
        uint256 amount,
        uint256 userRewardFee,
        uint256 ownerRewardFee,
        uint256 totalFee,
        address tokenAddress
    );

    event WithdrawLiquidity(address sender, address receiver, uint256 amount, address tokenAddress);

    event WithdrawReward(address sender, address receiver, uint256 amount, address tokenAddress);

    /*************************
     * Cross-chain Functions *
     *************************/

    function clientPayL2Settlement(
        address payable _to,
        uint256 _amount,
        address _tokenAddress
    ) external;
}