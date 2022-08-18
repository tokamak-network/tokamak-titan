/* Imports: External */
import { ethers, BigNumber, Contract, utils, ContractFactory } from 'ethers'
import { serialize } from '@ethersproject/transactions'
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

    const raw = serialize({
      nonce: parseInt(unsigned.nonce.toString(10), 10),
      value: unsigned.value,
      gasPrice: unsigned.gasPrice,
      gasLimit: unsigned.gasLimit,
      to: unsigned.to,
      data: unsigned.data,
    })

    // get l1 fee
    const l1Fee = await env.messenger.contracts.l2.OVM_GasPriceOracle.connect(
      gasPriceOracleWallet
    ).getL1Fee(raw)

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
    const TokamakL1Fee = l1Fee.mul(priceRatio)
    const TokamakL2Fee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

    // Make sure that user only pay transferred ETH
    expect(ETHBalanceBefore.sub(ETHBalanceAfter)).to.deep.equal(amount)

    // Make sure that the ETH Fee Vault should be increased to the l1 fee
    expect(ETHFeeVaultBalanceAfter.sub(ETHFeeVaultBalanceBefore)).to.deep.equal(l1Fee)

    // Make sure that we deduct tokamak amount(l1 + l2 fee) from user's account
    expect(TokamakBalanceBefore.sub(TokamakBalanceAfter)).to.deep.equal(
      TokamakL2Fee.add(TokamakL1Fee)
    )

    // the user pay tx fee as TOKAMAK, the fee is going to be vault
    // Make sure that the tokamak fee vault receives the tx fee
    expect(
      TokamakFeeVaultBalanceAfter.sub(TokamakFeeVaultBalanceBefore)
    ).to.deep.equal(TokamakL2Fee)

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

    // Compute the L1 portion of the fee
    const l1Fee =
    await await env.messenger.contracts.l2.OVM_GasPriceOracle.connect(
      gasPriceOracleWallet
    ).getL1Fee(
      serialize({
        nonce: tx.nonce,
        value: tx.value,
        gasPrice: tx.gasPrice,
        gasLimit: tx.gasLimit,
        to: tx.to,
        data: tx.data,
      })
    )

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
    const TokamakL1Fee = l1Fee.mul(priceRatio)
    const TokamakL2Fee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

    // Make sure that ETH balance doesn't change
    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)

    // Make sure that the ETH Fee Vault doesn't change
    expect(ETHFeeVaultBalanceAfter.sub(ETHFeeVaultBalanceBefore)).to.deep.equal(l1Fee)

    // Make sure that we deduct Tokamak from user's account
    expect(TokamakBalanceBefore.sub(TokamakBalanceAfter)).to.deep.equal(
      TokamakL2Fee.add(amount).add(TokamakL1Fee)
    )

    // Make sure that the Tokamak fee vault receives the tx fee
    expect(
      TokamakFeeVaultBalanceAfter.sub(TokamakFeeVaultBalanceBefore)
    ).to.deep.equal(TokamakL2Fee)

    await setPrices(env, 1)
  })

  it("{tag:tokamak} Should revert if users don't have enough Tokamak tokens", async () => {
    await setPrices(env, 1000)

    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TokamakBalanceBefore = await L2Tokamak.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TokamakFeeVaultBalanceBefore = await L2Tokamak.balanceOf(
      Tokamak_GasPriceOracle.address
    )
    // Send all Tokamak amount what from account has -> the account won't be able to pay tx fee
    await expect(L2Tokamak.transfer(other, TokamakBalanceBefore)).to.be.revertedWith(
      'execution reverted: ERC20: transfer amount exceeds balance'
    )
    const ETHBalanceAfter = await env.l2Wallet.getBalance()
    const TokamakBalanceAfter = await L2Tokamak.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TokamakFeeVaultBalanceAfter = await L2Tokamak.balanceOf(
      Tokamak_GasPriceOracle.address
    )

    // Make sure that ETH balance doesn't change
    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)

    // Make sure that the ETH Fee Vault doesn't change
    expect(ETHFeeVaultBalanceAfter).to.deep.equal(ETHFeeVaultBalanceBefore)

    // Make sure that we don't deduct tokamak from user's account
    expect(TokamakBalanceBefore).to.deep.equal(TokamakBalanceAfter)

    // Make sure that the tokamak fee vault doesn't change
    expect(TokamakFeeVaultBalanceAfter).to.deep.equal(TokamakFeeVaultBalanceBefore)

    await setPrices(env, 1)
  })

  it('{tag:tokamak} should compute correct tokamak fee for transferring ETH', async () => {
    await setPrices(env, 1000)

    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TokamakBalanceBefore = await L2Tokamak.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TokamakFeeVaultBalanceBefore = await L2Tokamak.balanceOf(
      Tokamak_GasPriceOracle.address
    )
    const unsigned = await env.l2Wallet.populateTransaction({
      to: env.l2Wallet.address,
      value: 0,
    })

    const raw = serialize({
      nonce: parseInt(unsigned.nonce.toString(10), 10),
      value: unsigned.value,
      gasPrice: unsigned.gasPrice,
      gasLimit: unsigned.gasLimit,
      to: unsigned.to,
      data: unsigned.data,
    })

    // get l1 fee
    const l1Fee = await env.messenger.contracts.l2.OVM_GasPriceOracle.connect(
      gasPriceOracleWallet
    ).getL1Fee(raw)

    // send ETH
    const tx = await env.l2Wallet.sendTransaction(unsigned)
    const receipt = await tx.wait()

    const priceRatio = await Tokamak_GasPriceOracle.priceRatio()
    const tokamakL1Fee = l1Fee.mul(priceRatio)
    const TokamakL2Fee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

    const ETHBalanceAfter = await env.l2Wallet.getBalance()
    const TokamakBalanceAfter = await L2Tokamak.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TokamakFeeVaultBalanceAfter = await L2Tokamak.balanceOf(
      Tokamak_GasPriceOracle.address
    )
    const tokamakBalanceDiff = TokamakBalanceBefore.sub(TokamakBalanceAfter)
    const tokamakFeeReceived = TokamakFeeVaultBalanceAfter.sub(
      TokamakFeeVaultBalanceBefore
    )
    expect(tokamakBalanceDiff).to.deep.equal(TokamakL2Fee.add(tokamakL1Fee))
    // There is no inflation
    expect(tokamakFeeReceived).to.deep.equal(TokamakL2Fee)

    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)
    expect(ETHFeeVaultBalanceAfter.sub(ETHFeeVaultBalanceBefore)).to.deep.equal(l1Fee)

    await setPrices(env, 1)
  })
})
