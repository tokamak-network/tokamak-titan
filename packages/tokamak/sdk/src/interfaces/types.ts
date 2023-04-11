import { Contract, BigNumber } from 'ethers'
import { AddressLike } from '@eth-optimism/sdk'

/**
 * L1 network chain IDs
 */
export enum L1ChainID {
  MAINNET = 1,
  GOERLI = 5,
  KOVAN = 42,
  HARDHAT_LOCAL = 31337,
  BEDROCK_LOCAL_DEVNET = 900,
}

/**
 * L2 network chain IDs
 */
export enum L2ChainID {
  OPTIMISM = 10,
  OPTIMISM_GOERLI = 420,
  OPTIMISM_KOVAN = 69,
  OPTIMISM_HARDHAT_LOCAL = 31337,
  OPTIMISM_HARDHAT_DEVNET = 17,
  OPTIMISM_BEDROCK_LOCAL_DEVNET = 901,
}

/**
 * L1 contract references.
 */
export interface OEL1Contracts {
  AddressManager: Contract
  L1CrossDomainMessenger: Contract
  L1CrossDomainMessengerFast: Contract
  L1StandardBridge: Contract
  StateCommitmentChain: Contract
  CanonicalTransactionChain: Contract
  BondManager: Contract
  // Bedrock
  OptimismPortal: Contract
  L2OutputOracle: Contract
}

/**
 * L2 contract references.
 */
export interface OEL2Contracts {
  L2CrossDomainMessenger: Contract
  L2StandardBridge: Contract
  L2ToL1MessagePasser: Contract
  OVM_L1BlockNumber: Contract
  OVM_L2ToL1MessagePasser: Contract
  OVM_DeployerWhitelist: Contract
  OVM_ETH: Contract
  OVM_GasPriceOracle: Contract
  OVM_SequencerFeeVault: Contract
  WETH: Contract
  BedrockMessagePasser: Contract
}

/**
 * Represents Optimism contracts, assumed to be connected to their appropriate
 * providers and addresses.
 */
export interface OEContracts {
  l1: OEL1Contracts
  l2: OEL2Contracts
}

/**
 * Convenience type for something that looks like the L1 OE contract interface but could be
 * addresses instead of actual contract objects.
 */
export type OEL1ContractsLike = {
  [K in keyof OEL1Contracts]: AddressLike
}

/**
 * Convenience type for something that looks like the L2 OE contract interface but could be
 * addresses instead of actual contract objects.
 */
export type OEL2ContractsLike = {
  [K in keyof OEL2Contracts]: AddressLike
}

/**
 * Convenience type for something that looks like the OE contract interface but could be
 * addresses instead of actual contract objects.
 */
export interface OEContractsLike {
  l1: OEL1ContractsLike
  l2: OEL2ContractsLike
}

/**
 * Enum describing the status of a message.
 */
export enum MessageStatus {
  /**
   * Message is an L1 to L2 message and has not been processed by the L2.
   */
  UNCONFIRMED_L1_TO_L2_MESSAGE,

  /**
   * Message is an L1 to L2 message and the transaction to execute the message failed.
   * When this status is returned, you will need to resend the L1 to L2 message, probably with a
   * higher gas limit.
   */
  FAILED_L1_TO_L2_MESSAGE,

  /**
   * Message is an L2 to L1 message and no state root has been published yet.
   */
  STATE_ROOT_NOT_PUBLISHED,

  /**
   * Message is an L2 to L1 message and awaiting the challenge period.
   */
  IN_CHALLENGE_PERIOD,

  /**
   * Message is ready to be relayed.
   */
  READY_FOR_RELAY,

  /**
   * Message has been relayed.
   */
  RELAYED,
  /**
   * Message has been relayed but failed in execution.
   */
  RELAYED_FAILED,
}
/**
 * Stuff that can be coerced into a number.
 */
export type NumberLike = string | number | BigNumber
