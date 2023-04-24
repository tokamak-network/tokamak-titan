import { getContractInterface } from '@eth-optimism/contracts'
import { getContractInterface as getContractInterfaceBedrock } from '@eth-optimism/contracts-bedrock'
import { ethers, Contract } from 'ethers'
import { toAddress, DeepPartial, AddressLike } from '@eth-optimism/sdk'

import {
  OEContracts,
  OEL1Contracts,
  OEL2Contracts,
  OEContractsLike,
} from '../interfaces'
import { CONTRACT_ADDRESSES, DEFAULT_L2_CONTRACT_ADDRESSES } from '../utils'

/**
 * We've changed some contract names in this SDK to be a bit nicer. Here we remap these nicer names
 * back to the original contract names so we can look them up.
 */
const NAME_REMAPPING = {
  AddressManager: 'Lib_AddressManager' as const,
  OVM_L1BlockNumber: 'iOVM_L1BlockNumber' as const,
  WETH: 'WETH9' as const,
  BedrockMessagePasser: 'L2ToL1MessagePasser' as const,
}

/**
 * Returns an ethers.Contract object for the given name, connected to the appropriate address for
 * the given L2 chain ID. Users can also provide a custom address to connect the contract to
 * instead. If the chain ID is not known then the user MUST provide a custom address or this
 * function will throw an error.
 *
 * @param contractName Name of the contract to connect to.
 * @param l2ChainId Chain ID for the L2 network.
 * @param opts Additional options for connecting to the contract.
 * @param opts.address Custom address to connect to the contract.
 * @param opts.signerOrProvider Signer or provider to connect to the contract.
 * @returns An ethers.Contract object connected to the appropriate address and interface.
 */
export const getOEContract = (
  contractName: keyof OEL1Contracts | keyof OEL2Contracts,
  l2ChainId: number,
  opts: {
    address?: AddressLike
    signerOrProvider?: ethers.Signer | ethers.providers.Provider
  } = {}
): Contract => {
  const addresses = CONTRACT_ADDRESSES[l2ChainId]
  if (addresses === undefined && opts.address === undefined) {
    throw new Error(
      `cannot get contract ${contractName} for unknown L2 chain ID ${l2ChainId}, you must provide an address`
    )
  }

  // Bedrock interfaces are backwards compatible. We can prefer Bedrock interfaces over legacy
  // interfaces if they exist.
  const name = NAME_REMAPPING[contractName] || contractName
  let iface: ethers.utils.Interface
  try {
    iface = getContractInterfaceBedrock(name)
  } catch (err) {
    iface = getContractInterface(name)
  }

  // we changed some part of L1CrossDomainMessenger
  // get the interface of L1CrossDomainMessenger (not use getContractInterfaceBedrock)
  if (name === 'L1CrossDomainMessenger') {
    iface = getContractInterface(name)
  }

  return new Contract(
    toAddress(
      opts.address || addresses.l1[contractName] || addresses.l2[contractName]
    ),
    iface,
    opts.signerOrProvider
  )
}

/**
 * Automatically connects to all contract addresses, both L1 and L2, for the given L2 chain ID. The
 * user can provide custom contract address overrides for L1 or L2 contracts. If the given chain ID
 * is not known then the user MUST provide custom contract addresses for ALL L1 contracts or this
 * function will throw an error.
 *
 * @param l2ChainId Chain ID for the L2 network.
 * @param opts Additional options for connecting to the contracts.
 * @param opts.l1SignerOrProvider: Signer or provider to connect to the L1 contracts.
 * @param opts.l2SignerOrProvider: Signer or provider to connect to the L2 contracts.
 * @param opts.overrides Custom contract address overrides for L1 or L2 contracts.
 * @returns An object containing ethers.Contract objects connected to the appropriate addresses on
 * both L1 and L2.
 */
export const getAllOEContracts = (
  l2ChainId: number,
  opts: {
    l1SignerOrProvider?: ethers.Signer | ethers.providers.Provider
    l2SignerOrProvider?: ethers.Signer | ethers.providers.Provider
    overrides?: DeepPartial<OEContractsLike>
  } = {}
): OEContracts => {
  const addresses = CONTRACT_ADDRESSES[l2ChainId] || {
    l1: {
      AddressManager: undefined,
      L1CrossDomainMessenger: undefined,
      L1CrossDomainMessengerFast: undefined,
      L1StandardBridge: undefined,
      StateCommitmentChain: undefined,
      CanonicalTransactionChain: undefined,
      BondManager: undefined,
      OptimismPortal: undefined,
      L2OutputOracle: undefined,
    },
    l2: DEFAULT_L2_CONTRACT_ADDRESSES,
  }

  // Attach all L1 contracts.
  const l1Contracts = {} as OEL1Contracts
  for (const [contractName, contractAddress] of Object.entries(addresses.l1)) {
    // Now we do not support Bedrock
    // if (
    //   contractName === 'OptimismPortal' ||
    //   contractName === 'L2OutputOracle' ||
    //   contractName === 'L2ToL1MessagePasser'
    // ) {
    //   continue
    // }
    // console.log('getAllOEContracts / contractName: ' + contractName)

    l1Contracts[contractName] = getOEContract(
      contractName as keyof OEL1Contracts,
      l2ChainId,
      {
        address: opts.overrides?.l1?.[contractName] || contractAddress,
        signerOrProvider: opts.l1SignerOrProvider,
      }
    )
  }

  // Attach all L2 contracts.
  const l2Contracts = {} as OEL2Contracts
  for (const [contractName, contractAddress] of Object.entries(addresses.l2)) {
    l2Contracts[contractName] = getOEContract(
      contractName as keyof OEL2Contracts,
      l2ChainId,
      {
        address: opts.overrides?.l2?.[contractName] || contractAddress,
        signerOrProvider: opts.l2SignerOrProvider,
      }
    )
  }

  return {
    l1: l1Contracts,
    l2: l2Contracts,
  }
}
