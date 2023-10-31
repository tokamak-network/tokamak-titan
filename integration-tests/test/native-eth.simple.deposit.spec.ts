0/* Imports: External */
import { Wallet, utils } from 'ethers'

/* Imports: Internal */
import { expect } from './shared/setup'
import { DEFAULT_TEST_GAS_L1, DEFAULT_TEST_GAS_L2 } from './shared/utils'
import { OptimismEnv } from './shared/env'

describe('Native ETH Integration Tests', async () => {
  let env: OptimismEnv
  let l1Bob: Wallet
  let l2Bob: Wallet

  const getBalances = async (_env: OptimismEnv) => {
    const l1UserBalance = await _env.l1Wallet.getBalance()

    const l1BobBalance = await l1Bob.getBalance()
    const l2BobBalance = await l2Bob.getBalance()

    const l1BridgeBalance = await _env.l1Wallet.provider.getBalance(
      _env.messenger.contracts.l1.L1StandardBridge.address
    )

    return {
      l1UserBalance,
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

  it('depositETHTo', async () => {
    const depositAmount = utils.parseEther('1')
    const preBalances = await getBalances(env)
    const depositReceipts = await env.waitForXDomainTransaction(
      env.messenger.contracts.l1.L1StandardBridge.depositETHTo(
        l2Bob.address,
        DEFAULT_TEST_GAS_L2,
        '0xFFFF',
        {
          value: depositAmount,
          gasLimit: DEFAULT_TEST_GAS_L1,
        }
      )
    )

    const l1FeePaid = depositReceipts.receipt.gasUsed.mul(
      depositReceipts.tx.gasPrice
    )
    console.log('l2Bob.address: ', l2Bob.address)
    const postBalances = await getBalances(env)
    expect(postBalances.l1BridgeBalance).to.deep.eq(
      preBalances.l1BridgeBalance.add(depositAmount)
    )
    expect(postBalances.l2BobBalance).to.deep.eq(
      preBalances.l2BobBalance.add(depositAmount)
    )
    expect(postBalances.l1UserBalance).to.deep.eq(
      preBalances.l1UserBalance.sub(l1FeePaid.add(depositAmount))
    )
  })
})
