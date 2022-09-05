// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Ton_GasPriceOracleProxyCall {
    address public gasPriceOracleAddress;

    constructor(address _gasPriceOracleAddress) {
        gasPriceOracleAddress = _gasPriceOracleAddress;
    }

    /**
     * Add the users that want to use TON as the fee token
     */
    function useTonAsFeeToken() public {
        Ton_GasPriceOracle(gasPriceOracleAddress).useBobaAsFeeToken();
    }

    /**
     * Add the users that want to use ETH as the fee token
     */
    function useETHAsFeeToken() public {
        Ton_GasPriceOracle(gasPriceOracleAddress).useETHAsFeeToken();
    }
}


interface Ton_GasPriceOracle {
  function useBobaAsFeeToken() external;
  function useETHAsFeeToken() external;
}