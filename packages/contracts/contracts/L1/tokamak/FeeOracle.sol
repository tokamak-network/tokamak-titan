// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

/* External Imports */
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { iFeeOracle } from "./iFeeOracle.sol";
import { IChainStorageContainer } from "../rollup/IChainStorageContainer.sol";
import { Lib_OVMCodec } from "../../libraries/codec/Lib_OVMCodec.sol";
import { Lib_SecureMerkleTrie } from "../../libraries/trie/Lib_SecureMerkleTrie.sol";
import { Lib_PredeployAddresses } from "../../libraries/constants/Lib_PredeployAddresses.sol";
import { Lib_AddressResolver } from "../../libraries/resolver/Lib_AddressResolver.sol";

contract FeeOracle is Ownable, iFeeOracle, Lib_AddressResolver {
    // 0 <= feePercentage <= 100
    mapping(uint256 => uint256) public feePercentage;

    event FeePercentageUpdated(uint256, uint256);

    constructor(address _libAddressManager, address _owner)
        Ownable()
        Lib_AddressResolver(address(_libAddressManager))
    {
        transferOwnership(_owner);
    }

    function setFeePercentage(uint256 _blockNumber, uint256 _feePercentage) public onlyOwner {
        require(getTotalBatches() + 10000 < _blockNumber, "must be at least 10000 blocks later");

        feePercentage[_blockNumber] = _feePercentage;
        emit FeePercentageUpdated(_blockNumber, _feePercentage);
    }

    function challengeFee(uint256 _blockNumber, L2MessageInclusionProof calldata _proof)
        public
        returns (bool)
    {
        bytes32 storageKey = keccak256(
            abi.encodePacked(
                _blockNumber,
                uint256(0) // should be storage slot number
            )
        );

        (bool exists, bytes memory encodedMessagePassingAccount) = Lib_SecureMerkleTrie.get(
            abi.encodePacked(Lib_PredeployAddresses.FEE_ORACLE),
            _proof.stateTrieWitness,
            _proof.stateRoot
        );

        require(
            exists == true,
            "Message passing predeploy has not been initialized or invalid proof provided."
        );

        Lib_OVMCodec.EVMAccount memory account = Lib_OVMCodec.decodeEVMAccount(
            encodedMessagePassingAccount
        );

        return
            Lib_SecureMerkleTrie.verifyInclusionProof(
                abi.encodePacked(storageKey),
                abi.encodePacked(uint8(1)),
                _proof.storageTrieWitness,
                account.storageRoot
            );
    }

    function batches() internal view returns (IChainStorageContainer) {
        return IChainStorageContainer(resolve("ChainStorageContainer-CTC-batches"));
    }

    function getTotalBatches() internal view returns (uint256 _totalBatches) {
        return batches().length();
    }
}
