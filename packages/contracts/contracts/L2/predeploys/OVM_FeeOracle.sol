// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/* External Imports */
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract OVM_FeeOracle is Ownable {
    // 0 <= feePercentage <= 100
    mapping(uint256 => uint256) public feePercentage;

    event FeePercentageUpdated(uint256, uint256);

    constructor(address _owner) Ownable() {
        transferOwnership(_owner);
    }

    function setFeePercentage(uint256 _blockNumber, uint256 _feePercentage) public onlyOwner {
        feePercentage[_blockNumber] = _feePercentage;
        emit FeePercentageUpdated(_blockNumber, _feePercentage);
    }
}
