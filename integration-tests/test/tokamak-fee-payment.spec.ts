/* Imports: External */
import { ethers, BigNumber, Contract, utils, ContractFactory } from 'ethers'
import { predeploys, getContractFactory } from '@eth-optimism/contracts'

/* Imports: Internal */
import { expect } from './shared/setup'
import { OptimismEnv } from './shared/env'
import { gasPriceOracleWallet } from './shared/utils'
import Tokamak_GasPriceOracleProxyCallJson from '../artifacts/contracts/Tokamak_GasPriceOracleProxyCall.sol/Tokamak_GasPriceOracleProxyCall.json'

const setPrices = async (env: OptimismEnv, value: number | BigNumber) => {
  const gasPrice = await env.messenger.contracts.l2.OVM_GasPriceOracle.connect(
    gasPriceOracleWallet
  ).setGasPrice(value)
  await gasPrice.wait()
  const baseFee = await env.messenger.contracts.l2.OVM_GasPriceOracle.connect(
    gasPriceOracleWallet
  ).setL1BaseFee(value)
  await baseFee.wait()
}

describe('Tokamak Fee Payment Integration Tests', () => {
  let env: OptimismEnv
  let L2Tokamak: Contract
  let Tokamak_GasPriceOracle: Contract
  let Proxy__Tokamak_GasPriceOracle: Contract
  let Factory__Tokamak_GasPriceOracleProxyCall: ContractFactory
  let Tokamak_GasPriceOracleProxyCall: Contract

  const other = '0x1234123412341234123412341234123412341234'

  // excute before
  before(async () => {
    env = await OptimismEnv.new()

    L2Tokamak = getContractFactory('L2StandardERC20')
      .attach(predeploys.L2StandardERC20)
      .connect(env.l2Wallet)

    Tokamak_GasPriceOracle = getContractFactory('Tokamak_GasPriceOracle')
      .attach(predeploys.Proxy__Tokamak_GasPriceOracle)
      .connect(env.l2Wallet)

    Proxy__Tokamak_GasPriceOracle = getContractFactory(
      'Lib_ResolvedDelegateTokamakProxy'
    )
      .attach(predeploys.Proxy__Tokamak_GasPriceOracle)
      .connect(env.l2Wallet)

    Factory__Tokamak_GasPriceOracleProxyCall = new ethers.ContractFactory(
      Tokamak_GasPriceOracleProxyCallJson.abi,
      Tokamak_GasPriceOracleProxyCallJson.bytecode,
      env.l2Wallet
    )

    // deploy contract
    Tokamak_GasPriceOracleProxyCall =
      await Factory__Tokamak_GasPriceOracleProxyCall.deploy(
        Tokamak_GasPriceOracle.address
      )
    await Tokamak_GasPriceOracleProxyCall.deployTransaction.wait()
  })

  it('{tag:tokamak} should have correct proxy target and proxy owner', async () => {
    expect(
      await Proxy__Tokamak_GasPriceOracle.addressManager('proxyOwner')
    ).to.be.eq(env.l1Wallet.address)
    expect(
      await Proxy__Tokamak_GasPriceOracle.addressManager('proxyTarget')
    ).to.be.eq(predeploys.Tokamak_GasPriceOracle)
  })

  it('{tag:tokamak} should register to use tokamak as the fee token', async () => {
    // Register l2wallet for using tokamak as the fee token
    const registerTx = await Tokamak_GasPriceOracle.useTokamakAsFeeToken()
    await registerTx.wait()

    // if l2wallet.address use tokamak as fee token, return true
    expect(
      await Tokamak_GasPriceOracle.tokamakFeeTokenUsers(env.l2Wallet.address)
    ).to.be.deep.eq(true)
  })

  // Tokamak_GasPriceOracleProxyCall is non EOA
  it('{tag:tokamak} should not register the fee tokens for non EOA accounts', async () => {
    await expect(Tokamak_GasPriceOracleProxyCall.useTokamakAsFeeToken()).to.be
      .reverted
    await expect(Tokamak_GasPriceOracleProxyCall.useETHAsFeeToken()).to.be
      .reverted
  })

  it('{tag:tokamak} Paying a nonzero but acceptable tokamak gasPrice fee for transferring ETH', async () => {
    // set l1, l2 gasprice
    await setPrices(env, 1000)

    const amount = utils.parseEther('0.0000001')
    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TokamakBalanceBefore = await L2Tokamak.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TokamakFeeVaultBalanceBefore = await L2Tokamak.balanceOf(
      Tokamak_GasPriceOracle.address
    )
    // check ETHBalanceBefore is more than amount
    expect(ETHBalanceBefore.gt(amount))

    const unsigned = await env.l2Wallet.populateTransaction({
      to: other,
      value: amount,
      gasLimit: 500000,
    })

    const tx = await env.l2Wallet.sendTransaction(unsigned)
    const receipt = await tx.wait()
    expect(receipt.status).to.eq(1)

    const ETHBalanceAfter = await env.l2Wallet.getBalance()
    const TokamakBalanceAfter = await L2Tokamak.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TokamakFeeVaultBalanceAfter = await L2Tokamak.balanceOf(
      Tokamak_GasPriceOracle.address
    )

    const priceRatio = await Tokamak_GasPriceOracle.priceRatio()
    // tokamakFee = receipt.gasUsed * tx.gasPrice * priceRatio
    const txTokamakFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

    // Make sure that user only pay transferred ETH
    expect(ETHBalanceBefore.sub(ETHBalanceAfter)).to.deep.equal(amount)

    // Make sure that the ETH Fee Vault doesn't change
    expect(ETHFeeVaultBalanceAfter).to.deep.equal(ETHFeeVaultBalanceBefore)

    // Make sure that we deduct tokamak from user's account
    expect(TokamakBalanceBefore.sub(TokamakBalanceAfter)).to.deep.equal(
      txTokamakFee
    )

    // the user pay tx fee as TOKAMAK, the fee is going to be vault
    // Make sure that the tokamak fee vault receives the tx fee
    expect(
      TokamakFeeVaultBalanceAfter.sub(TokamakFeeVaultBalanceBefore)
    ).to.deep.equal(txTokamakFee)

    await setPrices(env, 1)
  })

  it('{tag:tokamak} Paying a nonzero but acceptable tokamak gasPrice fee for transferring TOKAMAK', async () => {
    await setPrices(env, 1000)

    const amount = utils.parseEther('0.0000001')
    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TokamakBalanceBefore = await L2Tokamak.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TokamakFeeVaultBalanceBefore = await L2Tokamak.balanceOf(
      Tokamak_GasPriceOracle.address
    )
    expect(TokamakBalanceBefore.gt(amount))

    const tx = await L2Tokamak.transfer(other, amount)
    const receipt = await tx.wait()
    expect(receipt.status).to.eq(1)

    const ETHBalanceAfter = await env.l2Wallet.getBalance()
    const TokamakBalanceAfter = await L2Tokamak.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TokamakFeeVaultBalanceAfter = await L2Tokamak.balanceOf(
      Tokamak_GasPriceOracle.address
    )

    const priceRatio = await Tokamak_GasPriceOracle.priceRatio()
    const txTokamakFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

    // Make sure that ETH balance doesn't change
    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)

    // Make sure that the ETH Fee Vault doesn't change
    expect(ETHFeeVaultBalanceAfter).to.deep.equal(ETHFeeVaultBalanceBefore)

    // Make sure that we deduct Tokamak from user's account
    expect(TokamakBalanceBefore.sub(TokamakBalanceAfter)).to.deep.equal(
      txTokamakFee.add(amount)
    )

    // Make sure that the Tokamak fee vault receives the tx fee
    expect(
      TokamakFeeVaultBalanceAfter.sub(TokamakFeeVaultBalanceBefore)
    ).to.deep.equal(txTokamakFee)

    await setPrices(env, 1)
  })
})
