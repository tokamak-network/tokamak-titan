/* Imports: External */
import { ethers, BigNumber, Contract, utils, ContractFactory } from 'ethers'
import { predeploys, getContractFactory } from '@eth-optimism/contracts'

/* Imports: Internal */
import { expect } from './shared/setup'
import { OptimismEnv } from './shared/env'
import { L1_TOKEN_ADDRESS, gasPriceOracleWallet } from './shared/utils'
import Ton_GasPriceOracleProxyCallJson from '../artifacts/contracts/Ton_GasPriceOracleProxyCall.sol/Ton_GasPriceOracleProxyCall.json'

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

// Note: Test only fee token is TON
describe('Ton Fee Payment Integration Tests', () => {
  let env: OptimismEnv
  let L1Ton: Contract
  let L2Ton: Contract
  let Ton_GasPriceOracle: Contract
  let Proxy__Ton_GasPriceOracle: Contract
  let Factory__Ton_GasPriceOracleProxyCall: ContractFactory
  let Ton_GasPriceOracleProxyCall: Contract

  const other = '0x1234123412341234123412341234123412341234'

  // excute before
  before(async () => {
    env = await OptimismEnv.new()

    L1Ton = getContractFactory('TON')
    .attach(L1_TOKEN_ADDRESS)
    .connect(env.l1Wallet)

    L2Ton = getContractFactory('L2StandardERC20')
      .attach(predeploys.L2StandardERC20)
      .connect(env.l2Wallet)

    Ton_GasPriceOracle = getContractFactory('Ton_GasPriceOracle')
      .attach(predeploys.Proxy__Ton_GasPriceOracle)
      .connect(env.l2Wallet)

    Proxy__Ton_GasPriceOracle = getContractFactory(
      'Lib_ResolvedDelegateTonProxy'
    )
      .attach(predeploys.Proxy__Ton_GasPriceOracle)
      .connect(env.l2Wallet)

    Factory__Ton_GasPriceOracleProxyCall = new ethers.ContractFactory(
      Ton_GasPriceOracleProxyCallJson.abi,
      Ton_GasPriceOracleProxyCallJson.bytecode,
      env.l2Wallet
    )

    // deploy contract
    Ton_GasPriceOracleProxyCall =
      await Factory__Ton_GasPriceOracleProxyCall.deploy(
        Ton_GasPriceOracle.address
      )
    await Ton_GasPriceOracleProxyCall.deployTransaction.wait()
  })

  it('should have correct proxy target and proxy owner', async () => {
    expect(
      await Proxy__Ton_GasPriceOracle.addressManager('proxyOwner')
    ).to.be.eq(env.l1Wallet.address)
    expect(
      await Proxy__Ton_GasPriceOracle.addressManager('proxyTarget')
    ).to.be.eq(predeploys.Ton_GasPriceOracle)
  })

  it('should register to use ton as the fee token', async () => {
    // Register l2wallet for using ton as the fee token
    const registerTx = await Ton_GasPriceOracle.useTonAsFeeToken()
    await registerTx.wait()

    // if l2wallet.address use ton as fee token, return true
    expect(
      await Ton_GasPriceOracle.tonFeeTokenUsers(env.l2Wallet.address)
    ).to.be.deep.eq(true)
  })

  // Ton_GasPriceOracleProxyCall is non EOA
  it('should not register the fee tokens for non EOA accounts', async () => {
    await expect(Ton_GasPriceOracleProxyCall.useTonAsFeeToken()).to.be
      .reverted
    await expect(Ton_GasPriceOracleProxyCall.useETHAsFeeToken()).to.be
      .reverted
  })

  it('Paying a nonzero but acceptable ton gasPrice fee for transferring ETH', async () => {
    // set l1, l2 gasprice
    await setPrices(env, 1000)

    const amount = utils.parseEther('0.0000001')
    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TonBalanceBefore = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceBefore = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
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
    const TonBalanceAfter = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceAfter = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
    )

    const priceRatio = await Ton_GasPriceOracle.priceRatio()
    const tonFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

    // Make sure that user only pay transferred ETH
    expect(ETHBalanceBefore.sub(ETHBalanceAfter)).to.deep.equal(amount)

    // Make sure that the ETH Fee Vault doesn't change
    expect(ETHFeeVaultBalanceAfter).to.deep.equal(ETHFeeVaultBalanceBefore)

    // Make sure that we deduct ton (tx fee) from user's account
    expect(TonBalanceBefore.sub(TonBalanceAfter)).to.deep.equal(tonFee)

    // the user pay tx fee as TON, the fee is going to be vault
    // Make sure that the ton fee vault receives the tx fee
    expect(
      TonFeeVaultBalanceAfter.sub(TonFeeVaultBalanceBefore)
    ).to.deep.equal(tonFee)

    await setPrices(env, 1)
  })

  it('Paying a nonzero but acceptable ton gasPrice fee for transferring TON', async () => {
    await setPrices(env, 0)

    const amount = utils.parseEther('0.0000001')
    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TonBalanceBefore = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceBefore = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
    )
    expect(TonBalanceBefore.gt(amount))

    const tx = await L2Ton.transfer(other, amount)
    const receipt = await tx.wait()
    expect(receipt.status).to.eq(1)

    const ETHBalanceAfter = await env.l2Wallet.getBalance()
    const TonBalanceAfter = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceAfter = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
    )

    const priceRatio = await Ton_GasPriceOracle.priceRatio()
    const tonFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

    // Make sure that ETH balance doesn't change
    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)

    // Make sure that the ETH Fee Vault doesn't change
    expect(ETHFeeVaultBalanceAfter).to.deep.equal(ETHFeeVaultBalanceBefore)

    // Make sure that we deduct Ton from user's account
    expect(TonBalanceBefore.sub(TonBalanceAfter)).to.deep.equal(
      tonFee.add(amount)
    )

    // Make sure that the Ton fee vault receives the tx fee
    expect(
      TonFeeVaultBalanceAfter.sub(TonFeeVaultBalanceBefore)
    ).to.deep.equal(tonFee)

    await setPrices(env, 1)
  })

  it("Should revert if users don't have enough TON tokens", async () => {
    await setPrices(env, 1000)

    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TonBalanceBefore = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceBefore = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
    )
    // Send all Ton amount what from account has -> the account won't be able to pay tx fee
    await expect(L2Ton.transfer(other, TonBalanceBefore)).to.be.revertedWith(
      'execution reverted: ERC20: transfer amount exceeds balance'
    )
    const ETHBalanceAfter = await env.l2Wallet.getBalance()
    const TonBalanceAfter = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceAfter = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
    )

    // Make sure that ETH balance doesn't change
    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)

    // Make sure that the ETH Fee Vault doesn't change
    expect(ETHFeeVaultBalanceAfter).to.deep.equal(ETHFeeVaultBalanceBefore)

    // Make sure that we don't deduct ton from user's account
    expect(TonBalanceBefore).to.deep.equal(TonBalanceAfter)

    // Make sure that the ton fee vault doesn't change
    expect(TonFeeVaultBalanceAfter).to.deep.equal(TonFeeVaultBalanceBefore)

    await setPrices(env, 1)
  })

  it('should compute correct ton fee for transferring ETH', async () => {
    await setPrices(env, 1000)

    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TonBalanceBefore = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceBefore = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
    )
    const unsigned = await env.l2Wallet.populateTransaction({
      to: env.l2Wallet.address,
      value: 0,
    })

    // send ETH
    const tx = await env.l2Wallet.sendTransaction(unsigned)
    const receipt = await tx.wait()
    const priceRatio = await Ton_GasPriceOracle.priceRatio()
    const tonFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

    const ETHBalanceAfter = await env.l2Wallet.getBalance()
    const TonBalanceAfter = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceAfter = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
    )
    const tonBalanceDiff = TonBalanceBefore.sub(TonBalanceAfter)
    const tonFeeReceived = TonFeeVaultBalanceAfter.sub(
      TonFeeVaultBalanceBefore
    )
    expect(tonBalanceDiff).to.deep.equal(tonFee)
    // There is no inflation
    expect(tonFeeReceived).to.deep.equal(tonFee)

    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)
    expect(ETHFeeVaultBalanceAfter).to.deep.equal(ETHFeeVaultBalanceBefore)

    await setPrices(env, 1)
  })

  it('should compute correct ton fee for transferring TON', async () => {
    await setPrices(env, 1000)

    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TonBalanceBefore = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceBefore = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
    )

    // send 0 TON
    const tx = await L2Ton.transfer(env.l2Wallet.address, 0)

    const receipt = await tx.wait()

    const priceRatio = await Ton_GasPriceOracle.priceRatio()
    const tonFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
    const ETHBalanceAfter = await env.l2Wallet.getBalance()
    const TonBalanceAfter = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceAfter = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
    )
    const tonBalanceDiff = TonBalanceBefore.sub(TonBalanceAfter)
    const tonFeeReceived = TonFeeVaultBalanceAfter.sub(
      TonFeeVaultBalanceBefore
    )
    expect(tonBalanceDiff).to.deep.equal(tonFee)
    // There is no inflation
    expect(tonFeeReceived).to.deep.equal(tonFee)

    // no change
    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)
    expect(ETHFeeVaultBalanceAfter).to.deep.equal(ETHFeeVaultBalanceBefore)

    await setPrices(env, 1)
  })

  it('should compute correct fee with different gas limit for transferring ETH', async () => {
    await setPrices(env, 0)

    const amount = utils.parseEther('0.0000001')

    const estimatedGas = await env.l2Wallet.estimateGas({
      to: env.l2Wallet.address,
      value: amount,
    })
    let gasLimit = estimatedGas.toNumber()

    // gaslimit should be increased 100 for loop
    while (gasLimit < estimatedGas.toNumber() + 1000) {
      const ETHBalanceBefore = await env.l2Wallet.getBalance()
      const TonBalanceBefore = await L2Ton.balanceOf(env.l2Wallet.address)
      const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
        predeploys.OVM_SequencerFeeVault
      )
      const TonFeeVaultBalanceBefore = await L2Ton.balanceOf(
        Ton_GasPriceOracle.address
      )
      const unsigned = await env.l2Wallet.populateTransaction({
        to: env.l2Wallet.address,
        value: amount,
        gasLimit
      })

      // send ETH
      const tx = await env.l2Wallet.sendTransaction(unsigned)
      const receipt = await tx.wait()

      const priceRatio = await Ton_GasPriceOracle.priceRatio()
      const tonFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
      const ETHBalanceAfter = await env.l2Wallet.getBalance()
      const TonBalanceAfter = await L2Ton.balanceOf(env.l2Wallet.address)
      const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
        predeploys.OVM_SequencerFeeVault
      )
      const TonFeeVaultBalanceAfter = await L2Ton.balanceOf(
        Ton_GasPriceOracle.address
      )
      const tonBalanceDiff = TonBalanceBefore.sub(TonBalanceAfter)
      const tonFeeReceived = TonFeeVaultBalanceAfter.sub(
        TonFeeVaultBalanceBefore
      )

      expect(tonBalanceDiff).to.deep.equal(tonFee)
      expect(tonFeeReceived).to.deep.equal(tonFee)

      // no change
      expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)
      expect(ETHFeeVaultBalanceAfter).to.deep.equal(ETHFeeVaultBalanceBefore)

      gasLimit += 100
    }

    await setPrices(env, 1)
  })

  it('should compute correct fee with different gas limit for transferring TON', async () => {
    await setPrices(env, 1000)

    const estimatedGas = await L2Ton.estimateGas.transfer(
      env.l2Wallet.address,
      ethers.utils.parseEther('1')
    )
    let gasLimit = estimatedGas.toNumber()

    while (gasLimit < estimatedGas.toNumber() + 1000) {
      const ETHBalanceBefore = await env.l2Wallet.getBalance()
      const TonBalanceBefore = await L2Ton.balanceOf(env.l2Wallet.address)
      const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
        predeploys.OVM_SequencerFeeVault
      )
      const TonFeeVaultBalanceBefore = await L2Ton.balanceOf(
        Ton_GasPriceOracle.address
      )
      const tx = await L2Ton.transfer(
        env.l2Wallet.address,
        ethers.utils.parseEther('1'),
      )
      const receipt = await tx.wait()

      const priceRatio = await Ton_GasPriceOracle.priceRatio()
      const tonFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
      const ETHBalanceAfter = await env.l2Wallet.getBalance()
      const TonBalanceAfter = await L2Ton.balanceOf(env.l2Wallet.address)
      const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
        predeploys.OVM_SequencerFeeVault
      )
      const TonFeeVaultBalanceAfter = await L2Ton.balanceOf(
        Ton_GasPriceOracle.address
      )
      const tokmakaBalanceDiff = TonBalanceBefore.sub(TonBalanceAfter)
      const tonFeeReceived = TonFeeVaultBalanceAfter.sub(
        TonFeeVaultBalanceBefore
      )

      // tx fee
      expect(tokmakaBalanceDiff).to.deep.equal(tonFee)

      // l2 fee
      expect(tonFeeReceived).to.deep.equal(tonFee)

      // no change
      expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)
      expect(ETHFeeVaultBalanceAfter).to.deep.equal(ETHFeeVaultBalanceBefore)

      gasLimit += 100
    }

    await setPrices(env, 1)
  })

  it('should reject a transaction with a too low gas limit', async () => {
    const tx = {
      to: env.l2Wallet.address,
      value: ethers.utils.parseEther('0.001'),
      gasLimit: 1100000,
    }

    const gasLimit = await env.l2Wallet.estimateGas(tx)
    tx.gasLimit = gasLimit.toNumber() - 10

    await expect(env.l2Wallet.sendTransaction(tx)).to.be.rejectedWith(
      'invalid transaction: intrinsic gas too low'
    )
  })

  it('should not be able to withdraw fees before the minimum is met', async () => {

    await expect(Ton_GasPriceOracle.withdrawTON()).to.be.rejected
  })

  // Ton Ethereum special fields on the receipt
  it('includes Ton fee', async () => {
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

    const priceRatio = await Ton_GasPriceOracle.priceRatio()

    const tx = await env.l2Wallet.sendTransaction({
      to: env.l2Wallet.address,
      value: ethers.utils.parseEther('0.000001'),
    })
    const receipt = await tx.wait()
    const txTonFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
    const json = await env.l2Provider.send('eth_getTransactionReceipt', [
      tx.hash,
    ])

    expect(l1GasUsed).to.deep.equal(BigNumber.from(json.l1GasUsed))
    expect(l1GasPrice).to.deep.equal(BigNumber.from(json.l1GasPrice))
    expect(scaled.toString()).to.deep.equal(json.l1FeeScalar)
    expect(l1Fee).to.deep.equal(BigNumber.from(json.l1Fee))
    expect(json.erc20L2Fee).to.deep.equal(txTonFee)
  })

  // Ton Ethereum special fields on the receipt
  it('includes Ton fee with different gas price', async () => {
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

    const priceRatio = await Ton_GasPriceOracle.priceRatio()

    let gasPrice = 1

    while (gasPrice < 4) {
      const tx = await env.l2Wallet.sendTransaction({
        to: env.l2Wallet.address,
        value: 0,
        gasPrice,
      })
      const receipt = await tx.wait()
      const txTonFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
      const json = await env.l2Provider.send('eth_getTransactionReceipt', [
        tx.hash,
      ])

      expect(l1GasUsed).to.deep.equal(BigNumber.from(json.l1GasUsed))
      expect(l1GasPrice).to.deep.equal(BigNumber.from(json.l1GasPrice))
      expect(scaled.toString()).to.deep.equal(json.l1FeeScalar)
      expect(l1Fee).to.deep.equal(BigNumber.from(json.l1Fee))
      expect(json.erc20L2Fee).to.deep.equal(txTonFee)

      gasPrice += 1
    }
  })

  it('should pay TON to deploy contracts', async () => {
    await setPrices(env, 1000)

    const ETHBalanceBefore = await env.l2Wallet.getBalance()
    const TonBalanceBefore = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceBefore = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceBefore = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
    )

    // deploy test contract
    const TestContract = await Factory__Ton_GasPriceOracleProxyCall.deploy(
      Ton_GasPriceOracle.address
    )
    const receipt = await TestContract.deployTransaction.wait()
    const priceRatio = await Ton_GasPriceOracle.priceRatio()
    // receipt.gasUsed * 1000 * priceRatio
    const tonFee = receipt.gasUsed.mul(BigNumber.from(1000)).mul(priceRatio)
    const ETHBalanceAfter = await env.l2Wallet.getBalance()
    const TonBalanceAfter = await L2Ton.balanceOf(env.l2Wallet.address)
    const ETHFeeVaultBalanceAfter = await env.l2Wallet.provider.getBalance(
      predeploys.OVM_SequencerFeeVault
    )
    const TonFeeVaultBalanceAfter = await L2Ton.balanceOf(
      Ton_GasPriceOracle.address
    )
    const tonBalanceDiff = TonBalanceBefore.sub(TonBalanceAfter)
    const tonFeeReceived = TonFeeVaultBalanceAfter.sub(
      TonFeeVaultBalanceBefore
    )
    const ETHFeeVaultBalanceDiff = ETHFeeVaultBalanceAfter.sub(ETHFeeVaultBalanceBefore)

    expect(tonBalanceDiff).to.deep.equal(tonFee)

    expect(tonFeeReceived).to.deep.equal(tonFee)

    expect(ETHBalanceBefore).to.deep.equal(ETHBalanceAfter)

    expect(ETHFeeVaultBalanceDiff).to.deep.equal(BigNumber.from(0))

    await setPrices(env, 1)
  })

  it('should pay ton fee with 0 ETH in the wallet', async () => {
    const wallet = ethers.Wallet.createRandom().connect(env.l2Provider)

    const fundTx = await env.l2Wallet.sendTransaction({
      to: wallet.address,
      value: ethers.utils.parseEther('1'),
    })
    await fundTx.wait()

    const fundTonTx = await L2Ton.transfer(
      wallet.address,
      ethers.utils.parseEther('10')
    )
    await fundTonTx.wait()

    // Register the fee token
    const registerTx = await Ton_GasPriceOracle.connect(
      wallet
    ).useTonAsFeeToken()
    await registerTx.wait()

    const addTonTx = await L2Ton.connect(env.l2Wallet).transfer(
      wallet.address,
      ethers.utils.parseEther('200')
    )
    await addTonTx.wait()

    // Transfer all eth to the original owner
    const ETHBalance = await wallet.getBalance()
    const dropETHTx = await wallet.sendTransaction({
      to: env.l2Wallet.address,
      value: ETHBalance,
    })
    await dropETHTx.wait()

    const ETHBalanceAfter = await wallet.getBalance()

    expect(ETHBalanceAfter).to.deep.eq(BigNumber.from('0'))
  })

  it('should return the correct receipt', async () => {
    const randomWallet = ethers.Wallet.createRandom().connect(
      env.l2Wallet.provider
    )

    const transferTx = await env.l2Wallet.sendTransaction({
      to: randomWallet.address,
      value: ethers.utils.parseEther('0.01'),
    })
    await transferTx.wait()

    const fundTonTx = await L2Ton.transfer(
      randomWallet.address,
      ethers.utils.parseEther('10')
    )
    await fundTonTx.wait()

    const registerTx = await Ton_GasPriceOracle.connect(
      randomWallet
    ).useTonAsFeeToken()
    await registerTx.wait()

    const json = await env.l2Provider.send('eth_getTransactionReceipt', [
      registerTx.hash,
    ])
    expect(json.erc20L2Fee).to.deep.equal(BigNumber.from(0))
  })

  it('should be able to withdraw fees back to L1 once the minimum is met', async function () {
    const feeWallet = await Ton_GasPriceOracle.feeWallet()
    const balanceBefore = await L1Ton.balanceOf(feeWallet)
    const withdrawalAmount = await Ton_GasPriceOracle.MIN_WITHDRAWAL_AMOUNT()

    const l2WalletBalance = await L2Ton.balanceOf(env.l2Wallet.address)
    if (l2WalletBalance.lt(withdrawalAmount)) {
      console.log(
        `NOTICE: must have at least ${ethers.utils.formatEther(
          withdrawalAmount
        )} TON on L2 to execute this test, skipping`
      )
      this.skip()
    }

    // Transfer the minimum required to withdraw.
    const tx = await L2Ton.transfer(
      Ton_GasPriceOracle.address,
      withdrawalAmount
    )
    await tx.wait()

    const vaultBalance = await L2Ton.balanceOf(Ton_GasPriceOracle.address)

    // Submit the withdrawal.
    const withdrawTx = await Ton_GasPriceOracle.withdrawTON({
      gasPrice: 0,
    })

    // Wait for the withdrawal to be relayed to L1.
    await withdrawTx.wait()
    // call exception
    await env.relayXDomainMessages(withdrawTx)
    await env.waitForXDomainTransaction(withdrawTx)

    // Balance difference should be equal to old L2 balance.
    const balanceAfter = await L1Ton.balanceOf(feeWallet)
    expect(balanceAfter.sub(balanceBefore)).to.deep.equal(
      BigNumber.from(vaultBalance)
    )
  })

  it('should register to use ETH as the fee token', async () => {
    // Register l1wallet for using ETH as the fee token
    const registerTx = await Ton_GasPriceOracle.useETHAsFeeToken()
    await registerTx.wait()
    expect(
      await Ton_GasPriceOracle.tonFeeTokenUsers(env.l2Wallet.address)
    ).to.be.deep.eq(false)
  })
})
