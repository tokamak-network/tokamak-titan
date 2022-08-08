// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Tokamak_GasPriceOracleProxyCall {
    address public gasPriceOracleAddress;

    constructor(address _gasPriceOracleAddress) {
        gasPriceOracleAddress = _gasPriceOracleAddress;
    }

    /**
     * Add the users that want to use TOKAMAK as the fee token
     */
    function useTokamakAsFeeToken() public {
        Tokamak_GasPriceOracle(gasPriceOracleAddress).useBobaAsFeeToken();
    }

    /**
     * Add the users that want to use ETH as the fee token
     */
    function useETHAsFeeToken() public {
        Tokamak_GasPriceOracle(gasPriceOracleAddress).useETHAsFeeToken();
    }
}


interface Tokamak_GasPriceOracle {
  function useBobaAsFeeToken() external;
  function useETHAsFeeToken() external;
}