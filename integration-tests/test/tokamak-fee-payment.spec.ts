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
  // let L1Tokamak: Contract
  let L2Tokamak: Contract
  let Tokamak_GasPriceOracle: Contract
  let Proxy__Tokamak_GasPriceOracle: Contract
  let Factory__Tokamak_GasPriceOracleProxyCall: ContractFactory
  let Tokamak_GasPriceOracleProxyCall: Contract

  const other = '0x1234123412341234123412341234123412341234'

  // excute before
  before(async () => {
    env = await OptimismEnv.new()

    L1Tokamak = getContractFactory('TOKAMAK')
    .attach(process.env.L1_TOKEN_ADDRESS)
    .connect(env.l1Wallet)

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
    const tokamakL2Fee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

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
    expect(tokamakBalanceDiff).to.deep.equal(tokamakL2Fee.add(tokamakL1Fee))
    // There is no inflation
    expect(tokamakFeeReceived).to.deep.equal(tokamakL2Fee)

    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)
    expect(ETHFeeVaultBalanceAfter.sub(ETHFeeVaultBalanceBefore)).to.deep.equal(l1Fee)

    await setPrices(env, 1)
  })

  it('{tag:tokamak} should compute correct tokamak fee for transferring TOKAMAK', async () => {
    await setPrices(env, 1000)

    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TokamakBalanceBefore = await L2Tokamak.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TokamakFeeVaultBalanceBefore = await L2Tokamak.balanceOf(
      Tokamak_GasPriceOracle.address
    )

    // send 0 TOKAMAK
    const tx = await L2Tokamak.transfer(env.l2Wallet.address, 0)

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
    const priceRatio = await Tokamak_GasPriceOracle.priceRatio()
    const tokamakL1Fee = l1Fee.mul(priceRatio)
    const tokamakL2Fee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
    const txTokamakFee = tokamakL1Fee.add(tokamakL2Fee)
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
    expect(tokamakBalanceDiff).to.deep.equal(txTokamakFee)
    // There is no inflation
    expect(tokamakFeeReceived).to.deep.equal(tokamakL2Fee)

    // no change
    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)
    expect(ETHFeeVaultBalanceAfter.sub(ETHFeeVaultBalanceBefore)).to.deep.equal(l1Fee)

    await setPrices(env, 1)
  })

  it('{tag:tokamak} should compute correct fee with different gas limit for transferring ETH', async () => {
    await setPrices(env, 1000)

    const amount = utils.parseEther('0.0000001')

    const estimatedGas = await env.l2Wallet.estimateGas({
      to: env.l2Wallet.address,
      value: amount,
    })
    let gasLimit = estimatedGas.toNumber()

    // gaslimit should be increased 100 for loop
    while (gasLimit < estimatedGas.toNumber() + 1000) {
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
        value: amount,
        gasLimit
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
      const tokamakL2Fee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
      const txTokamakFee = tokamakL1Fee.add(tokamakL2Fee)
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

      expect(tokamakBalanceDiff).to.deep.equal(txTokamakFee)
      expect(tokamakFeeReceived).to.deep.equal(tokamakL2Fee)

      // amount
      // expect(ETHBalanceBefore.sub(ETHBalanceAfter)).to.deep.equal(amount)
      expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)

      // l1 fee
      expect(ETHFeeVaultBalanceAfter.sub(ETHFeeVaultBalanceBefore)).to.deep.equal(l1Fee)

      gasLimit += 100
    }

    await setPrices(env, 1)
  })

  it('{tag:tokamak} should compute correct fee with different gas limit for transferring Tokamak', async () => {
    await setPrices(env, 1000)

    const estimatedGas = await L2Tokamak.estimateGas.transfer(
      env.l2Wallet.address,
      ethers.utils.parseEther('1')
    )
    let gasLimit = estimatedGas.toNumber()

    while (gasLimit < estimatedGas.toNumber() + 1000) {
      const ETHBalanceBefore = await env.l2Wallet.getBalance()
      const TokamakBalanceBefore = await L2Tokamak.balanceOf(env.l2Wallet.address)
      const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
        predeploys.OVM_SequencerFeeVault
      )
      const TokamakFeeVaultBalanceBefore = await L2Tokamak.balanceOf(
        Tokamak_GasPriceOracle.address
      )
      const tx = await L2Tokamak.transfer(
        env.l2Wallet.address,
        ethers.utils.parseEther('1'),
        { gasLimit }
      )

      const l1Fee = await env.messenger.contracts.l2.OVM_GasPriceOracle.connect(gasPriceOracleWallet).getL1Fee(serialize({
          nonce: tx.nonce,
          value: tx.value,
          gasPrice: tx.gasPrice,
          gasLimit: tx.gasLimit,
          to: tx.to,
          data: tx.data,
        })
      )
      const receipt = await tx.wait()
      const priceRatio = await Tokamak_GasPriceOracle.priceRatio()
      const tokamakL1Fee = l1Fee.mul(priceRatio)
      const tokamakL2Fee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
      const txTokamakFee = tokamakL1Fee.add(tokamakL2Fee)
      const ETHBalanceAfter = await env.l2Wallet.getBalance()
      const TokamakBalanceAfter = await L2Tokamak.balanceOf(env.l2Wallet.address)
      const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
        predeploys.OVM_SequencerFeeVault
      )
      const TokamakFeeVaultBalanceAfter = await L2Tokamak.balanceOf(
        Tokamak_GasPriceOracle.address
      )
      const tokmakaBalanceDiff = TokamakBalanceBefore.sub(TokamakBalanceAfter)
      const tokamakFeeReceived = TokamakFeeVaultBalanceAfter.sub(
        TokamakFeeVaultBalanceBefore
      )

      // tx fee + amount
      expect(tokmakaBalanceDiff).to.deep.equal(txTokamakFee.add(tx.value))

      // l2 fee
      expect(tokamakFeeReceived).to.deep.equal(tokamakL2Fee)

      // no change
      expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)

      // l1 fee
      expect(ETHFeeVaultBalanceAfter.sub(ETHFeeVaultBalanceBefore)).to.deep.equal(l1Fee)

      gasLimit += 100
    }

    await setPrices(env, 1)
  })

  it('{tag:tokamak} should reject a transaction with a too low gas limit', async () => {
    const tx = {
      to: env.l2Wallet.address,
      value: ethers.utils.parseEther('0.000001'),
      gasLimit: 1100000,
    }

    const gasLimit = await env.l2Wallet.estimateGas(tx)
    tx.gasLimit = gasLimit.toNumber() - 10

    await expect(env.l2Wallet.sendTransaction(tx)).to.be.rejectedWith(
      'invalid transaction: intrinsic gas too low'
    )
  })

  it('{tag:tokamak} should not be able to withdraw fees before the minimum is met', async () => {

    await expect(Tokamak_GasPriceOracle.withdrawTOKAMAK()).to.be.rejected
  })

  // it('{tag:tokamak} should be able to withdraw fees back to L1 once the minimum is met', async function () {
  //   const feeWallet = await Tokamak_GasPriceOracle.feeWallet()
  //   const balanceBefore = await L1Tokamak.balanceOf(feeWallet)
  //   const withdrawalAmount = await Tokamak_GasPriceOracle.MIN_WITHDRAWAL_AMOUNT()

  //   const l2WalletBalance = await L2Tokamak.balanceOf(env.l2Wallet.address)
  //   if (l2WalletBalance.lt(withdrawalAmount)) {
  //     console.log(
  //       `NOTICE: must have at least ${ethers.utils.formatEther(
  //         withdrawalAmount
  //       )} TOKAMAK on L2 to execute this test, skipping`
  //     )
  //     this.skip()
  //   }

  //   // Transfer the minimum required to withdraw.
  //   const tx = await L2Tokamak.transfer(
  //     Tokamak_GasPriceOracle.address,
  //     withdrawalAmount
  //   )
  //   await tx.wait()

  //   const vaultBalance = await L2Tokamak.balanceOf(Tokamak_GasPriceOracle.address)

  //   // Submit the withdrawal.
  //   const withdrawTx = await Tokamak_GasPriceOracle.withdrawTOKAMAK({
  //     gasPrice: 0,
  //   })

  //   // Wait for the withdrawal to be relayed to L1.
  //   await withdrawTx.wait()
  //   // call exception
  //   await env.relayXDomainMessages(withdrawTx)
  //   await env.waitForXDomainTransaction(withdrawTx)

  //   // Balance difference should be equal to old L2 balance.
  //   const balanceAfter = await L1Tokamak.balanceOf(feeWallet)
  //   expect(balanceAfter.sub(balanceBefore)).to.deep.equal(
  //     BigNumber.from(vaultBalance)
  //   )
  // })

  // Tokamak Ethereum special fields on the receipt
  it('{tag:tokamak} includes L2 Tokamak fee', async () => {
    const l1Fee = await env.messenger.contracts.l2.OVM_GasPriceOracle.getL1Fee(
      '0x'
    )
    const l1GasPrice =
      await env.messenger.contracts.l2.OVM_GasPriceOracle.l1BaseFee()
    const l1GasUsed =
      await env.messenger.contracts.l2.OVM_GasPriceOracle.getL1GasUsed('0x')
    const scalar = await env.messenger.contracts.l2.OVM_GasPriceOracle.scalar()
    const decimals =
      await env.messenger.contracts.l2.OVM_GasPriceOracle.decimals()

    const scaled = scalar.toNumber() / 10 ** decimals.toNumber()

    const priceRatio = await Tokamak_GasPriceOracle.priceRatio()

    const tx = await env.l2Wallet.sendTransaction({
      to: env.l2Wallet.address,
      value: ethers.utils.parseEther('0.000001'),
    })
    const receipt = await tx.wait()
    const txTokamakFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
    const json = await env.l2Provider.send('eth_getTransactionReceipt', [
      tx.hash,
    ])

    // l1GasUsed value from OVM_GasPriceOracle is not equal to value from receipt
    expect(l1GasUsed).to.deep.equal(BigNumber.from(json.l1GasUsed))
    expect(l1GasPrice).to.deep.equal(BigNumber.from(json.l1GasPrice))
    expect(scaled.toString()).to.deep.equal(json.l1FeeScalar)
    expect(l1Fee).to.deep.equal(BigNumber.from(json.l1Fee))
    expect(json.l2TokamakFee).to.deep.equal(txTokamakFee)
  })

  // Tokamak Ethereum special fields on the receipt
  it('{tag:tokamak} includes L2 Tokamak fee with different gas price', async () => {
    const l1Fee = await env.messenger.contracts.l2.OVM_GasPriceOracle.getL1Fee(
      '0x'
    )
    const l1GasPrice =
      await env.messenger.contracts.l2.OVM_GasPriceOracle.l1BaseFee()
    const l1GasUsed =
      await env.messenger.contracts.l2.OVM_GasPriceOracle.getL1GasUsed('0x')
    const scalar = await env.messenger.contracts.l2.OVM_GasPriceOracle.scalar()
    const decimals =
      await env.messenger.contracts.l2.OVM_GasPriceOracle.decimals()

    const scaled = scalar.toNumber() / 10 ** decimals.toNumber()

    const priceRatio = await Tokamak_GasPriceOracle.priceRatio()

    let gasPrice = 1

    while (gasPrice < 10) {
      const tx = await env.l2Wallet.sendTransaction({
        to: env.l2Wallet.address,
        // value: ethers.utils.parseEther('0.00001'),
        // value: 0,
        gasPrice,
      })
      const receipt = await tx.wait()
      const txTokamakFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
      const json = await env.l2Provider.send('eth_getTransactionReceipt', [
        tx.hash,
      ])

      expect(l1GasUsed).to.deep.equal(BigNumber.from(json.l1GasUsed))
      expect(l1GasPrice).to.deep.equal(BigNumber.from(json.l1GasPrice))
      expect(scaled.toString()).to.deep.equal(json.l1FeeScalar)
      expect(l1Fee).to.deep.equal(BigNumber.from(json.l1Fee))
      expect(json.l2TokamakFee).to.deep.equal(txTokamakFee)

      gasPrice += 1
    }
  })

  it('{tag:tokamak} should pay TOKAMAK to deploy contracts', async () => {
    await setPrices(env, 1000)

    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TokamakBalanceBefore = await L2Tokamak.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TokamakFeeVaultBalanceBefore = await L2Tokamak.balanceOf(
      Tokamak_GasPriceOracle.address
    )

    // deploy test contract
    const TestContract = await Factory__Tokamak_GasPriceOracleProxyCall.deploy(
      Tokamak_GasPriceOracle.address
    )
    const json = await env.l2Provider.send('eth_getTransactionReceipt', [
      TestContract.deployTransaction.hash
    ])
    const receipt = await TestContract.deployTransaction.wait()
    const priceRatio = await Tokamak_GasPriceOracle.priceRatio()
    const TokamakL1Fee = BigNumber.from(json.l1Fee).mul(priceRatio)
    // receipt.gasUsed * 1000 * priceRatio
    const TokamakL2Fee = receipt.gasUsed.mul(BigNumber.from(1000)).mul(priceRatio)
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
    const ETHFeeVaultBalanceDiff = ETHFeeVaultBalanceAfter.sub(ETHFeeVaultBalanceBefore)

    expect(tokamakBalanceDiff).to.deep.equal(TokamakL1Fee.add(TokamakL2Fee))
    // There is no inflation
    expect(tokamakFeeReceived).to.deep.equal(TokamakL2Fee)

    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)
    expect(ETHFeeVaultBalanceDiff).to.deep.equal(BigNumber.from(json.l1Fee))

    await setPrices(env, 1)
  })

  // it('{tag:tokamak} should pay tokamak fee with 0 ETH in the wallet', async () => {
  //   const wallet = ethers.Wallet.createRandom().connect(env.l2Provider)

  //   const fundTx = await env.l2Wallet.sendTransaction({
  //     to: wallet.address,
  //     value: ethers.utils.parseEther('1'),
  //   })
  //   await fundTx.wait()

  //   const fundTokamakTx = await L2Tokamak.transfer(
  //     wallet.address,
  //     ethers.utils.parseEther('10')
  //   )
  //   await fundTokamakTx.wait()

  //   // Register the fee token
  //   const registerTx = await Tokamak_GasPriceOracle.connect(
  //     wallet
  //   ).useTokamakAsFeeToken()
  //   await registerTx.wait()

  //   // Transfer Tokamak token
  //   // The l2 gas price and l1 base price should be calculated carefully.
  //   // If we go with the l2GasPrice=1GWEI, the minimum Tokamak amount for using
  //   // the Tokamak as the fee token is around 11 Tokamak. This is caused by how the
  //   // gas limit is estimated. In api.go, it estimates the gas from the middle
  //   // of the block gas limit and uses the binary search to find the good gas limit.
  //   // The Tokamak for the block.GasLimit / 2 is gasLimit * gasPrice * priceRatio =
  //   // 11_000_000 / 2 * 10^9 * 2000 / 10^18 = 11 TOKAMAK.
  //   // The ideal l2 gas price should be 0.1 GWEI, so the minimum Tokamak for users
  //   // to use the Tokamak as the fee token is 1.1 tokamak
  //   const addTokamakTx = await L2Tokamak.connect(env.l2Wallet).transfer(
  //     wallet.address,
  //     ethers.utils.parseEther('200')
  //   )
  //   await addTokamakTx.wait()

  //   // Transfer all eth to the original owner
  //   const ETHBalance = await wallet.getBalance()
  //   const dropETHTx = await wallet.sendTransaction({
  //     to: env.l2Wallet.address,
  //     value: ETHBalance,
  //   })
  //   await dropETHTx.wait()

  //   const ETHBalanceAfter = await wallet.getBalance()

  //   expect(ETHBalanceAfter).to.deep.eq(BigNumber.from('0'))
  // })

  it("{tag:tokamak} should revert tx if users don't have enough Tokamak", async () => {

    // create random wallet
    const wallet = ethers.Wallet.createRandom().connect(env.l2Provider)

    // fund 1 ETH
    const fundTx = await env.l2Wallet.sendTransaction({
      to: wallet.address,
      value: ethers.utils.parseEther('0.001'),
    })
    await fundTx.wait()

    // fund 10 TOKAMAK
    const fundTokamakTx = await L2Tokamak.transfer(
      wallet.address,
      ethers.utils.parseEther('10')
    )
    await fundTokamakTx.wait()

    // Register the fee token
    const registerTx = await Tokamak_GasPriceOracle.connect(
      wallet
    ).useTokamakAsFeeToken()
    await registerTx.wait()

    const TokamakBalance = await L2Tokamak.balanceOf(wallet.address)
    const estimateGas = await L2Tokamak.connect(wallet).estimateGas.transfer(
      env.l2Wallet.address,
      TokamakBalance
    )
    const priceRatio = await Tokamak_GasPriceOracle.priceRatio()
    const returnTokamakTx = await L2Tokamak.connect(wallet).transfer(
      env.l2Wallet.address,
      TokamakBalance.sub(estimateGas.mul(priceRatio)),
      { gasLimit: estimateGas }
    )
    await returnTokamakTx.wait()

    await expect(
      wallet.sendTransaction({
        to: env.l2Wallet.address,
        value: ethers.utils.parseEther('0.5'),
      })
    ).to.be.rejectedWith('insufficient tokamak balance to pay for gas')
  })

  // it('{tag:tokamak} should return the correct receipt', async () => {
  //   const randomWallet = ethers.Wallet.createRandom().connect(
  //     env.l2Wallet.provider
  //   )

  //   const transferTx = await env.l2Wallet.sendTransaction({
  //     to: randomWallet.address,
  //     value: ethers.utils.parseEther('1'),
  //   })
  //   await transferTx.wait()

  //   const fundTokamakTx = await L2Tokamak.transfer(
  //     randomWallet.address,
  //     ethers.utils.parseEther('10')
  //   )
  //   await fundTokamakTx.wait()

  //   const registerTx = await Tokamak_GasPriceOracle.connect(
  //     randomWallet
  //   ).useTokamakAsFeeToken()
  //   await registerTx.wait()

  //   const json = await env.l2Provider.send('eth_getTransactionReceipt', [
  //     registerTx.hash,
  //   ])
  //   expect(json.l2TokamakFee).to.deep.equal(BigNumber.from(0))
  // })

  // it('{tag:tokamak} should register to use ETH as the fee token', async () => {
  //   // Register l1wallet for using ETH as the fee token
  //   const registerTx = await Tokamak_GasPriceOracle.useETHAsFeeToken()
  //   await registerTx.wait()

  //   expect(
  //     await Tokamak_GasPriceOracle.tokamakFeeTokenUsers(env.l2Wallet.address)
  //   ).to.be.deep.eq(false)
  // })

})
