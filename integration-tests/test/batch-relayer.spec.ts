import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { BigNumber } from 'ethers'
import { predeploys } from '@eth-optimism/contracts'
import { expectApprox } from '@eth-optimism/core-utils'

// Message Contracts for test comms
import { OptimismEnv } from './shared/env'
import { DEFAULT_TEST_GAS_L2 } from './shared/utils'

chai.use(chaiAsPromised)

// Set the number of transactions to execute
const CONST_NUM_TXS = 12

describe('Batch Relayer Test', async () => {
  let env: OptimismEnv

  const getBalances = async (_env: OptimismEnv) => {
    const l1UserBalance = await _env.l1Wallet.getBalance()
    const l2UserBalance = await _env.l2Wallet.getBalance()

    const l1BridgeBalance = await _env.l1Wallet.provider.getBalance(
      _env.messenger.contracts.l1.L1StandardBridge.address
    )

    return {
      l1UserBalance,
      l2UserBalance,
      l1BridgeBalance,
    }
  }

  before(async () => {
    // set new environment
    env = await OptimismEnv.new()
  })

  // Test to withdraw from L2 to L1 using batch relayer
  it('can withdraw from L2 to L1 using the batch relayer', async () => {
    const preBalances = await getBalances(env)

    const withdrawAmount = BigNumber.from(3)
    const transaction =
      await env.messenger.contracts.l2.L2StandardBridge.withdraw(
        predeploys.OVM_ETH,
        withdrawAmount,
        DEFAULT_TEST_GAS_L2,
        '0xFFFF'
      )
    await transaction.wait()
    const receipts = await env.waitForXDomainTransaction(transaction)
    const fee = receipts.tx.gasLimit.mul(receipts.tx.gasPrice)
    const postBalances = await getBalances(env)

    // Approximate because there's a fee related to relaying the L2 => L1 message and it throws off the math.
    expectApprox(
      postBalances.l1BridgeBalance,
      preBalances.l1BridgeBalance.sub(withdrawAmount),
      { percentUpperDeviation: 1 }
    )
    expectApprox(
      postBalances.l2UserBalance,
      preBalances.l2UserBalance.sub(withdrawAmount.add(fee)),
      { percentUpperDeviation: 1 }
    )
    expectApprox(
      postBalances.l1UserBalance,
      preBalances.l1UserBalance.add(withdrawAmount),
      { percentUpperDeviation: 1 }
    )
  })

  // Test to send multiple message from L2 to L1 using batch relayer
  it(`can withdraw from L2 to L1 ${CONST_NUM_TXS} times using the batch relayer`, async () => {
    const preBalances = await getBalances(env)
    const withdrawAmount = BigNumber.from(3)
    const withdraws = []

    // Submit multiple withdrawals
    for (let i = 0; i < CONST_NUM_TXS; i++) {
      const transaction =
        await env.messenger.contracts.l2.L2StandardBridge.withdraw(
          predeploys.OVM_ETH,
          withdrawAmount,
          DEFAULT_TEST_GAS_L2,
          '0xFFFF'
        )
      withdraws.push(transaction)
      // Delay for 1 second before sending the next message
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    // Wait for all transactions to be confirmed and processed
    await Promise.all(withdraws.map((transaction) => transaction.wait()))
    const receipts = await env.waitForXDomainTransaction(
      withdraws[withdraws.length - 1]
    )
    const fee = receipts.tx.gasLimit.mul(receipts.tx.gasPrice)
    const postBalances = await getBalances(env)

    // Approximate because there's a fee related to relaying the L2 => L1 message and it throws off the math.
    expectApprox(
      postBalances.l1BridgeBalance,
      preBalances.l1BridgeBalance.sub(withdrawAmount.mul(CONST_NUM_TXS)),
      { percentUpperDeviation: 1 }
    )
    expectApprox(
      postBalances.l2UserBalance,
      preBalances.l2UserBalance.sub(withdrawAmount.mul(CONST_NUM_TXS).add(fee)),
      { percentUpperDeviation: 1 }
    )
    expectApprox(
      postBalances.l1UserBalance,
      preBalances.l1UserBalance.add(withdrawAmount.mul(CONST_NUM_TXS)),
      { percentUpperDeviation: 1 }
    )
  })
})