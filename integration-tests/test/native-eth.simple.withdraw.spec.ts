/* Imports: External */
import { Wallet } from 'ethers'
import { ethers } from 'hardhat'
import { predeploys } from '@eth-optimism/contracts'
import { expectApprox } from '@eth-optimism/core-utils'

/* Imports: Internal */
import { expect } from './shared/setup'
import { DEFAULT_TEST_GAS_L2, withdrawalTest } from './shared/utils'
import { OptimismEnv } from './shared/env'

describe('Native ETH Integration Tests', async () => {
  let env: OptimismEnv
  let l1Bob: Wallet
  let l2Bob: Wallet

  const getBalances = async (_env: OptimismEnv) => {
    const l1BobBalance = await l1Bob.getBalance()
    const l2BobBalance = await l2Bob.getBalance()

    const l1BridgeBalance = await _env.l1Wallet.provider.getBalance(
      _env.messenger.contracts.l1.L1StandardBridge.address
    )

    return {
      l1BobBalance,
      l2BobBalance,
      l1BridgeBalance,
    }
  }

  before(async () => {
    env = await OptimismEnv.new()
    l1Bob = new Wallet(
      '0000000000000000000000000000000000000000000000000000000000000020',
      env.l1Wallet.provider
    )
    l2Bob = l1Bob.connect(env.l2Wallet.provider)
  })

  withdrawalTest('withdraw', async () => {
    const withdrawAmount = ethers.utils.parseEther('0.2')
    const preBalances = await getBalances(env)
    expect(
      preBalances.l2BobBalance.gt(0),
      'Cannot run withdrawal test before any deposits...'
    )

    const transaction =
      await env.messenger.contracts.l2.L2StandardBridge.connect(l2Bob).withdraw(
        predeploys.OVM_ETH,
        withdrawAmount,
        DEFAULT_TEST_GAS_L2,
        '0xFFFF'
      )

    await env.relayXDomainMessages(transaction)

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
      postBalances.l2BobBalance,
      preBalances.l2BobBalance.sub(withdrawAmount.add(fee)),
      { percentUpperDeviation: 1 }
    )
    expectApprox(
      postBalances.l1BobBalance,
      preBalances.l1BobBalance.add(withdrawAmount),
      { percentUpperDeviation: 1 }
    )
  })
})
