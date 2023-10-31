/* Imports: External */
import { Wallet, utils } from 'ethers'
import { serialize } from '@ethersproject/transactions'

/* Imports: Internal */
import { expect } from './shared/setup'
import { gasPriceOracleWallet } from './shared/utils'
import { OptimismEnv } from './shared/env'

describe('Native ETH Integration Tests', async () => {
  let env: OptimismEnv
  let l2Alice: Wallet
  let l2Bob: Wallet

  const getBalances = async (_env: OptimismEnv) => {
    const l2AliceBalance = await l2Alice.getBalance()
    const l2BobBalance = await l2Bob.getBalance()

    const l1BridgeBalance = await _env.l1Wallet.provider.getBalance(
      _env.messenger.contracts.l1.L1StandardBridge.address
    )

    return {
      l2AliceBalance,
      l2BobBalance,
      l1BridgeBalance,
    }
  }

  before(async () => {
    env = await OptimismEnv.new()
    l2Alice = new Wallet(
      '0000000000000000000000000000000000000000000000000000000000000010',
      env.l2Wallet.provider
    )
    l2Bob = new Wallet(
      '0000000000000000000000000000000000000000000000000000000000000020',
      env.l2Wallet.provider
    )
  })

  it('transferETHTo', async () => {
    const transferAmount = utils.parseEther('0.5')
    const preBalances = await getBalances(env)

    const unsigned = await l2Bob.populateTransaction({
      to: l2Alice.address,
      value: transferAmount,
    })

    const raw = serialize({
      nonce: parseInt(unsigned.nonce.toString(10), 10),
      value: unsigned.value,
      gasPrice: unsigned.gasPrice,
      gasLimit: unsigned.gasLimit,
      to: unsigned.to,
      data: unsigned.data,
    })

    const tx = await l2Bob.sendTransaction(unsigned)
    const receipt = await tx.wait()

    const l2FeePaid = receipt.gasUsed.mul(tx.gasPrice)
    const l1FeePaid =
      await env.messenger.contracts.l2.OVM_GasPriceOracle.connect(
        gasPriceOracleWallet
      ).getL1Fee(raw)

    const fee = l2FeePaid.add(l1FeePaid)

    const postBalances = await getBalances(env)
    expect(postBalances.l2AliceBalance).to.deep.eq(
      preBalances.l2AliceBalance.add(transferAmount)
    )
    expect(postBalances.l2BobBalance).to.deep.eq(
      preBalances.l2BobBalance.sub(fee.add(transferAmount))
    )
  })
})
