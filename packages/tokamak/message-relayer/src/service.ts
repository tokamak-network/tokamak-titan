/* Imports: External */
import { Signer, utils, BigNumber } from 'ethers'
import { getContractFactory } from '@eth-optimism/contracts'
import { Address, getChainId, sleep } from '@eth-optimism/core-utils'
import {
  BaseServiceV2,
  validators,
  Gauge,
  Counter,
} from '@eth-optimism/common-ts'
import * as ynatm from '@eth-optimism/ynatm'
import {
  CrossChainMessenger,
  MessageStatus,
  NumberLike,
  DEPOSIT_CONFIRMATION_BLOCKS,
  CHAIN_BLOCK_TIMES,
} from '@eth-optimism/sdk'
import { Provider } from '@ethersproject/abstract-provider'

import 'dotenv/config'

type MessageRelayerOptions = {
  l1RpcProvider: Provider
  l2RpcProvider: Provider
  l1Wallet: Signer
  // batch system
  minBatchSize: number
  maxWaitTimeS: number
  isFastRelayer: boolean
  enableRelayerFilter: boolean
  filterPollingInterval?: number
  multiRelayLimit?: number
  numConfirmations?: number
  maxWaitTxTimeS: number
  fromL2TransactionIndex?: number
  pollingInterval?: number
  addressManagerAddress?: Address
  maxGasPriceInGwei?: number
  gasRetryIncrement?: number
  resubmissionTimeout?: number
}

type MessageRelayerMetrics = {
  highestCheckedL2Tx: Gauge
  highestKnownL2Tx: Gauge
  // numRelayedMessages: Counter
  numBatchTx: Counter
}

type MessageRelayerState = {
  wallet: Signer
  messenger: CrossChainMessenger
  highestCheckedL2Tx: number
  highestKnownL2Tx: number
  //filter
  relayerFilter: Array<any>
  fastRelayerFilter: Array<any>
  lastFilterPollingTimestamp: number
  //batch system
  timeOfLastRelayS: number
  messageBuffer: Array<any>
  timeOfLastPendingRelay: any
}

export class MessageRelayerService extends BaseServiceV2<
  MessageRelayerOptions,
  MessageRelayerMetrics,
  MessageRelayerState
> {
  constructor(options?: Partial<MessageRelayerOptions>) {
    super({
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      version: require('../package.json').version,
      name: 'message-relayer',
      options,
      optionsSpec: {
        l1RpcProvider: {
          validator: validators.provider,
          desc: 'Provider for interacting with L1.',
          secret: true,
        },
        l2RpcProvider: {
          validator: validators.provider,
          desc: 'Provider for interacting with L2.',
          secret: true,
        },
        l1Wallet: {
          validator: validators.wallet,
          desc: 'Wallet used to interact with L1.',
          secret: true,
        },
        minBatchSize: {
          validator: validators.num,
          desc: 'Minimum size of the batch',
          default: 2,
        },
        maxWaitTimeS: {
          validator: validators.num,
          desc: 'Maximum number of seconds to wait for batch tx',
          default: 60,
        },
        isFastRelayer: {
          validator: validators.bool,
          desc: 'Whether the relayer support fast relay',
          default: false,
        },
        enableRelayerFilter: {
          validator: validators.bool,
          desc: 'Whether the relayer can use filter',
          default: true,
        },
        filterPollingInterval: {
          validator: validators.num,
          desc: 'The polling interval for getting filter',
          default: 60000,
        },
        maxWaitTxTimeS: {
          validator: validators.num,
          desc: 'Maximum time to wait for the next tx to be submitted since the last tx was submitted',
          default: 180,
        },
        multiRelayLimit: {
          validator: validators.num,
          desc: 'The limit size of message buffer',
          default: 10,
        },
        numConfirmations: {
          validator: validators.num,
          desc: 'The number of confirmations',
          default: 1,
        },
        fromL2TransactionIndex: {
          validator: validators.num,
          desc: 'Index of the first L2 transaction to start processing from.',
          default: 0,
        },
        pollingInterval: {
          validator: validators.num,
          desc: 'The polling interval of relayer service',
          default: 1000,
        },
        addressManagerAddress: {
          validator: validators.str,
          desc: 'Contract address of Address Manager.',
        },
        maxGasPriceInGwei: {
          validator: validators.num,
          desc: 'Max gas price in Gwei',
          default: 100,
        },
        gasRetryIncrement: {
          validator: validators.num,
          desc: 'Gas retry increment for relay tx',
        },
        resubmissionTimeout: {
          validator: validators.num,
          desc: 'Timeout in resubmission for relay tx',
          default: 60,
        },
      },
      metricsSpec: {
        highestCheckedL2Tx: {
          type: Gauge,
          desc: 'Highest L2 tx that has been scanned for messages',
        },
        highestKnownL2Tx: {
          type: Gauge,
          desc: 'Highest known L2 transaction',
        },
        // TODO: numRelayedMessages
        numBatchTx: {
          type: Counter,
          desc: 'Number of Batch tx',
        },
      },
    })
  }

  protected async init(): Promise<void> {
    if (process.env.FAST_RELAYER) {
      this.options.isFastRelayer = true
    }
    // check options
    this.logger.info('Initializing message relayer', {
      fromL2TransactionIndex: this.options.fromL2TransactionIndex,
      pollingInterval: this.options.pollingInterval,
      filterPollingInterval: this.options.filterPollingInterval,
      minBatchSize: this.options.minBatchSize,
      maxWaitTimeS: this.options.maxWaitTimeS,
      isFastRelayer: this.options.isFastRelayer,
    })

    this.state.wallet = this.options.l1Wallet.connect(
      this.options.l1RpcProvider
    )

    let contracts = {}

    if (this.options.addressManagerAddress) {
      const addressManager = getContractFactory('Lib_AddressManager')
        .connect(this.state.wallet)
        .attach(this.options.addressManagerAddress)
      const L1CrossDomainMessenger = await addressManager.getAddress(
        'Proxy__OVM_L1CrossDomainMessenger'
      )
      const L1CrossDomainMessengerFast = await addressManager.getAddress(
        'Proxy__L1CrossDomainMessengerFast'
      )
      const L1StandardBridge = await addressManager.getAddress(
        'Proxy__OVM_L1StandardBridge'
      )
      const StateCommitmentChain = await addressManager.getAddress(
        'StateCommitmentChain'
      )
      const CanonicalTransactionChain = await addressManager.getAddress(
        'CanonicalTransactionChain'
      )
      const BondManager = await addressManager.getAddress('BondManager')

      contracts = {
        l1: {
          AddressManager: this.options.addressManagerAddress,
          L1CrossDomainMessenger,
          L1CrossDomainMessengerFast,
          L1StandardBridge,
          StateCommitmentChain,
          CanonicalTransactionChain,
          BondManager,
          OptimismPortal: '0x0000000000000000000000000000000000000000' as const, // it should be used in bedrock
          L2OutputOracle: '0x0000000000000000000000000000000000000000' as const, // it should be used in bedrock
        },
      }
    }

    const l1ChainId = await getChainId(this.state.wallet.provider)
    const l2ChainId = await getChainId(this.options.l2RpcProvider)
    // use constants depends on ChainId (predefined network)
    const depositConfirmationBlocks: NumberLike =
      DEPOSIT_CONFIRMATION_BLOCKS[l2ChainId]
    const l1BlockTimeSeconds: NumberLike = CHAIN_BLOCK_TIMES[l1ChainId]

    this.state.messenger = new CrossChainMessenger({
      l1SignerOrProvider: this.state.wallet,
      l2SignerOrProvider: this.options.l2RpcProvider,
      l1ChainId,
      l2ChainId,
      depositConfirmationBlocks,
      l1BlockTimeSeconds,
      contracts,
      fastRelayer: this.options.isFastRelayer,
    })

    this.state.highestCheckedL2Tx = this.options.fromL2TransactionIndex || 1
    this.state.highestKnownL2Tx =
      await this.state.messenger.l2Provider.getBlockNumber()

    // filter
    this.state.relayerFilter = []
    this.state.fastRelayerFilter = []
    this.state.lastFilterPollingTimestamp = 0

    //batch system
    this.state.timeOfLastRelayS = Date.now()
    this.state.messageBuffer = []
    this.state.timeOfLastPendingRelay = false
  }

  protected async main(): Promise<void> {
    // Update metrics
    this.metrics.highestCheckedL2Tx.set(this.state.highestCheckedL2Tx)
    this.metrics.highestKnownL2Tx.set(this.state.highestKnownL2Tx)

    // If we're already at the tip, then update the latest tip and loop again.
    if (this.state.highestCheckedL2Tx > this.state.highestKnownL2Tx) {
      this.state.highestKnownL2Tx =
        await this.state.messenger.l2Provider.getBlockNumber()

      // Sleeping for 1000ms is good enough since this is meant for development and not for live
      // networks where we might want to restrict the number of requests per second.
      await sleep(1000)
      return
    }

    // get filter
    await this._getFilter()

    // Batch flushing logic

    const secondsElapsed = Math.floor(
      (Date.now() - this.state.timeOfLastRelayS) / 1000
    )
    console.log('Seconds elapsed since last batch push:', secondsElapsed)

    const timeOut = secondsElapsed > this.options.maxWaitTimeS ? true : false

    let pendingTXTimeOut = true
    if (this.state.timeOfLastPendingRelay !== false) {
      const pendingTXSecondsElapsed = Math.floor(
        (Date.now() - this.state.timeOfLastPendingRelay) / 1000
      )
      console.log('Next tx since last tx submitted', pendingTXSecondsElapsed)
      pendingTXTimeOut =
        pendingTXSecondsElapsed > this.options.maxWaitTxTimeS ? true : false
    }

    const bufferFull =
      this.state.messageBuffer.length >= this.options.minBatchSize
        ? true
        : false

    // check gas price
    const gasPrice = await this.state.wallet.getGasPrice()
    const gasPriceGwei = Number(utils.formatUnits(gasPrice, 'gwei'))
    const gasPriceAcceptable =
      gasPriceGwei < this.options.maxGasPriceInGwei ? true : false

    if (
      this.state.messageBuffer.length !== 0 &&
      (bufferFull || timeOut) &&
      pendingTXTimeOut
    ) {
      if (gasPriceAcceptable) {
        if (bufferFull) {
          console.log('Buffer full: flushing')
        }
        if (timeOut) {
          console.log('Buffer timeout: flushing')
        }

        // clean up the array
        const newMB = []

        // push cur to newMB depending on the message status
        for (const cur of this.state.messageBuffer) {
          const status =
            await this.state.messenger.getMessageStatusFromContracts(cur)
          if (
            // STATE_ROOT_NOT_PUBLISHED, IN_CHALLENGE_PERIOD, READY_FOR_RELAY
            status !== MessageStatus.RELAYED &&
            status !== MessageStatus.RELAYED_FAILED
          ) {
            newMB.push(cur)
          }
        }
        // update state.messageBuffer
        this.state.messageBuffer = newMB

        // empty
        if (this.state.messageBuffer.length === 0) {
          this.state.timeOfLastPendingRelay = false
        } else {
          // slice to subBuffer
          const subBuffer = this.state.messageBuffer.slice(
            0,
            this.options.multiRelayLimit
          )
          this.logger.info('Prepared message subBuffer', {
            subLen: subBuffer.length,
            bufLen: this.state.messageBuffer.length,
            limit: this.options.multiRelayLimit,
          })

          // ynatm logic
          const sendTxAndWaitForReceipt = async (
            _gasPrice: BigNumber
          ): Promise<any> => {
            // Generate the transaction we will repeatedly submit

            // nonce 조회
            const nonce = await this.options.l1Wallet.getTransactionCount()
            const txResponse = await this.state.messenger.finalizeBatchMessage(
              subBuffer,
              {
                overrides: {
                  gasPrice: _gasPrice,
                  nonce,
                },
              }
            )
            const txReceipt = await txResponse.wait(
              this.options.numConfirmations
            )
            return txReceipt
          }

          const minGasPrice = await this._getGasPriceInGwei(
            this.options.l1Wallet
          )
          let receipt
          try {
            // Gradually keeps trying a transaction with an incremental amount of gas
            // while keeping the same nonce.
            receipt = await ynatm.send({
              sendTransactionFunction: sendTxAndWaitForReceipt,
              minGasPrice: ynatm.toGwei(minGasPrice),
              maxGasPrice: ynatm.toGwei(this.options.maxGasPriceInGwei),
              gasPriceScalingFunction: ynatm.LINEAR(
                this.options.gasRetryIncrement
              ),
              delay: this.options.resubmissionTimeout,
            })
            this.logger.info('Relay transaction sent')
            this.metrics.numBatchTx.inc()
          } catch (err) {
            this.logger.error('Relay attempt failed, skipping', {
              message: err.toString(),
              stack: err.stack,
              code: err.code,
            })
          }

          if (!receipt) {
            this.logger.error('No receipt for relayMultiMessage transaction')
          } else if (receipt.status === 1) {
            this.logger.info('Sucessful relayMultiMessage', {
              blockNumber: receipt.blockNumber,
              transactionIndex: receipt.transactionIndex,
              status: receipt.status,
              msgCount: subBuffer.length,
              gasUsed: receipt.gasUsed.toString(),
              effectiveGasPrice: receipt.effectiveGasPrice.toString(),
            })
          } else {
            this.logger.warning('Unsuccessful relayMultiMessage', {
              blockNumber: receipt.blockNumber,
              transactionIndex: receipt.transactionIndex,
              status: receipt.status,
              msgCount: subBuffer.length,
              gasUsed: receipt.gasUsed.toString(),
              effectiveGasPrice: receipt.effectiveGasPrice.toString(),
            })
          }

          this.state.timeOfLastPendingRelay = Date.now()
        }
      } else {
        console.log('Current gas price is unacceptable')
        this.state.timeOfLastPendingRelay = Date.now()
      }
      this.state.timeOfLastRelayS = Date.now()
    } else {
      console.log(
        'Buffer still too small - current buffer length: ',
        this.state.messageBuffer.length
      )
      console.log('Buffer flush size set to: ', this.options.minBatchSize)
    }

    // TODO
    // scanning the new messages only if the pending messages are relayed
    // to l1

    this.logger.info(`checking L2 block ${this.state.highestCheckedL2Tx}`)

    const block =
      await this.state.messenger.l2Provider.getBlockWithTransactions(
        this.state.highestCheckedL2Tx
      )

    // Should never happen.
    if (block.transactions.length !== 1) {
      throw new Error(
        `got an unexpected number of transactions in block: ${block.number}`
      )
    }

    const messages = await this.state.messenger.getMessagesByTransaction(
      block.transactions[0].hash
    )

    // No messages in this transaction so we can move on to the next one.
    if (messages.length === 0) {
      this.state.highestCheckedL2Tx++
      return
    }

    // Make sure that all messages sent within the transaction are finalized. If any messages
    // are not finalized, then we're going to break the loop which will trigger the sleep and
    // wait for a few seconds before we check again to see if this transaction is finalized.
    let isFinalized = true
    for (const message of messages) {
      const status = await this.state.messenger.getMessageStatus(message)
      if (
        status === MessageStatus.IN_CHALLENGE_PERIOD ||
        status === MessageStatus.STATE_ROOT_NOT_PUBLISHED
      ) {
        isFinalized = false
      }
    }

    if (!isFinalized) {
      this.logger.info(
        `tx not yet finalized, waiting: ${this.state.highestCheckedL2Tx}`
      )
      return
    } else {
      this.logger.info(
        `tx is finalized, relaying: ${this.state.highestCheckedL2Tx}`
      )
    }

    // If we got here then all messages in the transaction are finalized. Now we can relay
    // each message to L1.
    for (const message of messages) {
      try {
        const tx = await this.state.messenger.finalizeMessage(message)
        this.logger.info(`relayer sent tx: ${tx.hash}`)
      } catch (err) {
        if (err.message.includes('message has already been received')) {
          // It's fine, the message was relayed by someone else
        } else {
          throw err
        }
      }
      await this.state.messenger.waitForMessageReceipt(message)
    }

    // All messages have been relayed so we can move on to the next block.
    this.state.highestCheckedL2Tx++
  }

  private async _getFilter(): Promise<void> {
    try {
      if (
        this.state.lastFilterPollingTimestamp === 0 ||
        new Date().getTime() >
          this.state.lastFilterPollingTimestamp +
            this.options.filterPollingInterval
      ) {
        const addressManager = getContractFactory('Lib_AddressManager')
          .connect(this.state.wallet)
          .attach(this.options.addressManagerAddress)
        const L1LiquidityPool = await addressManager.getAddress(
          'Proxy__L1LiquidityPool'
        )
        const L1StandardBridge = await addressManager.getAddress(
          'Proxy__OVM_L1StandardBridge'
        )
        const fastRelayerFilterSelect = [L1LiquidityPool]
        const relayerFilterSelect = [L1StandardBridge]

        this.state.lastFilterPollingTimestamp = new Date().getTime()
        this.state.fastRelayerFilter = fastRelayerFilterSelect
        this.state.relayerFilter = relayerFilterSelect
        this.logger.info('Found the two filters', {
          relayerFilterSelect,
          fastRelayerFilterSelect,
        })
      }
    } catch {
      this.logger.error('CRITICAL ERROR: Failed to fetch the Filter')
    }
  }

  private async _getGasPriceInGwei(signer): Promise<number> {
    return parseInt(utils.formatUnits(await signer.getGasPrice(), 'gwei'), 10)
  }
}

if (require.main === module) {
  const service = new MessageRelayerService()
  service.run()
}
