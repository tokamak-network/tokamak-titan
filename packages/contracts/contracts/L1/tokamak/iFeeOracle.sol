// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import { Lib_OVMCodec } from "../../libraries/codec/Lib_OVMCodec.sol";

/**
 * @title iFeeOracle
 */
interface iFeeOracle {
    struct L2MessageInclusionProof {
        bytes32 stateRoot;
        Lib_OVMCodec.ChainBatchHeader stateRootBatchHeader;
        Lib_OVMCodec.ChainInclusionProof stateRootProof;
        bytes stateTrieWitness;
        bytes storageTrieWitness;
    }

    /********************
     * Public Functions *
     ********************/

    function setFeePercentage(uint256 _blockNumber, uint256 _feePercentage) external;
}
