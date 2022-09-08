const {
  ContractFactory,
  providers,
  Wallet,
  utils,
  BigNumber,
} = require('ethers')
// const { serialize } = require('@ethersproject/transactions')
require('dotenv').config()

const main = async () => {
  const env = process.env
  const L2_NODE_WEB3_URL = env.L2_NODE_WEB3_URL
  const PRIV_KEY = env.PRIV_KEY
  const FEE_TOKEN = env.FEE_TOKEN

  // get provider
  const l2Provider = new providers.JsonRpcProvider(L2_NODE_WEB3_URL)
  const l2Wallet = new Wallet(PRIV_KEY).connect(l2Provider)
  const PROXY__TON_GAS_PRICE_ORACLE_ADDRESS =
    '0x4200000000000000000000000000000000000024'
  const L2_TON_ADDRESS = '0x4200000000000000000000000000000000000023'
  const OVM_GAS_PRICE_ORACLE_ADDRESS =
    '0x420000000000000000000000000000000000000F'

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  const OvmGasPriceOracleArtifact = require('../../packages/contracts/artifacts/contracts/L2/predeploys/OVM_GasPriceOracle.sol/OVM_GasPriceOracle.json')
  const factory__OvmGasPriceOracle = new ContractFactory(
    OvmGasPriceOracleArtifact.abi,
    OvmGasPriceOracleArtifact.bytecode
  )
  const Ovm_GasPriceOracle = factory__OvmGasPriceOracle
    .attach(OVM_GAS_PRICE_ORACLE_ADDRESS)
    .connect(l2Wallet)

  const TonGasPriceOracleArtifact = require('../../packages/contracts/artifacts/contracts/L2/predeploys/Ton_GasPriceOracle.sol/Ton_GasPriceOracle.json')
  const factory__TonGasPriceOracle = new ContractFactory(
    TonGasPriceOracleArtifact.abi,
    TonGasPriceOracleArtifact.bytecode
  )
  const Ton_GasPriceOracle = factory__TonGasPriceOracle
    .attach(PROXY__TON_GAS_PRICE_ORACLE_ADDRESS)
    .connect(l2Wallet)

  // load L2Ton contract
  const l2StandardERC20 = require('../../packages/contracts/artifacts/contracts/standards/L2StandardERC20.sol/L2StandardERC20.json')
  const factory__L2StandardERC20 = new ContractFactory(
    l2StandardERC20.abi,
    l2StandardERC20.bytecode
  )
  const L2Ton = factory__L2StandardERC20
    .attach(L2_TON_ADDRESS)
    .connect(l2Wallet)

  if (typeof FEE_TOKEN === 'undefined') {
    console.error(`FEE_TOKEN: ${FEE_TOKEN} is not supported`)
    return null
  }
  // check
  const isTonAsFeeToken = await Ton_GasPriceOracle.tonFeeTokenUsers(
    l2Wallet.address
  )

  // 1. ETH as fee token
  if (FEE_TOKEN.toLocaleUpperCase() === 'ETH') {
    // send tx (transfer TON)
    if (isTonAsFeeToken === false) {
      const amount = utils.parseEther('1')
      const other = '0x1234123412341234123412341234123412341234'
      const ETHBalanceBefore = await l2Wallet.getBalance()
      const TonBalanceBefore = await L2Ton.balanceOf(l2Wallet.address)
      console.log(
        `Balance ETH Before: ${utils.formatEther(ETHBalanceBefore)} ETH`
      )
      console.log(
        `Balance TON Before: ${utils.formatEther(TonBalanceBefore)} TON`
      )

      const tx = await L2Ton.transfer(other, amount)
      console.log('txHash: ', tx.hash)
      const receipt = await tx.wait()
      await sleep(3000)

      if (receipt.status === 1) {
        const json = await l2Provider.send('eth_getTransactionReceipt', [
          tx.hash,
        ])
        const ETHBalanceAfter = await l2Wallet.getBalance()
        const TonBalanceAfter = await L2Ton.balanceOf(l2Wallet.address)

        console.log(
          `Balance ETH After: ${utils.formatEther(ETHBalanceAfter)} ETH`
        )
        console.log(
          `Balance TON After: ${utils.formatEther(TonBalanceAfter)} TON`
        )
        const usedETH = ETHBalanceBefore.sub(ETHBalanceAfter)
        const usedTON = TonBalanceBefore.sub(TonBalanceAfter)
        console.log(
          'ETHBalanceAfter - ETHBalanceBefore: ',
          utils.formatEther(usedETH)
        )
        console.log(
          'TonBalanceAfter - TonBalanceBefore: ',
          utils.formatEther(usedTON)
        )
        l1Fee = BigNumber.from(json.l1Fee)
        l2Fee = receipt.gasUsed.mul(tx.gasPrice)
        console.log('L1Fee: ', utils.formatEther(l1Fee))
        console.log('L2Fee: ', utils.formatEther(l2Fee))
      }
    } else {
      console.log(
        `The address ${l2Wallet.address} is not registered ${FEE_TOKEN} as fee token`
      )
    }
  }
  // 2. TON as fee token
  else if (FEE_TOKEN.toLocaleUpperCase() === 'TON') {
    // send tx (transfer ETH)
    if (isTonAsFeeToken === true) {
      const amount = utils.parseEther('0.01')
      const other = '0x1234123412341234123412341234123412341234'
      const ETHBalanceBefore = await l2Wallet.getBalance()
      const TonBalanceBefore = await L2Ton.balanceOf(l2Wallet.address)

      console.log(
        `Balance ETH Before: ${utils.formatEther(ETHBalanceBefore)} ETH`
      )
      console.log(
        `Balance TON Before: ${utils.formatEther(TonBalanceBefore)} TON`
      )

      const unsigned = await l2Wallet.populateTransaction({
        to: other,
        value: amount,
        gasLimit: 500000,
      })

      const tx = await l2Wallet.sendTransaction(unsigned)
      console.log('txHash: ', tx.hash)
      const receipt = await tx.wait()
      await sleep(3000)
      if (receipt.status === 1) {
        const json = await l2Provider.send('eth_getTransactionReceipt', [
          tx.hash,
        ])
        const ETHBalanceAfter = await l2Wallet.getBalance()
        const TonBalanceAfter = await L2Ton.balanceOf(l2Wallet.address)

        console.log(
          `Balance ETH After: ${utils.formatEther(ETHBalanceAfter)} ETH`
        )
        console.log(
          `Balance TON After: ${utils.formatEther(TonBalanceAfter)} TON`
        )
        const usedETH = ETHBalanceBefore.sub(ETHBalanceAfter)
        const usedTON = TonBalanceBefore.sub(TonBalanceAfter)
        console.log(
          'ETHBalanceAfter - ETHBalanceBefore: ',
          utils.formatEther(usedETH)
        )
        console.log(
          'TonBalanceAfter - TonBalanceBefore: ',
          utils.formatEther(usedTON)
        )
        const priceRatio = await Ton_GasPriceOracle.priceRatio()
        const L1TonFee = BigNumber.from(json.l1Fee).mul(priceRatio)
        const ERC20L2Fee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

        console.log('L1TonFee: ', utils.formatEther(L1TonFee))
        console.log('ERC20L2Fee: ', utils.formatEther(ERC20L2Fee))
      }
    } else {
      console.log(
        `The address ${l2Wallet.address} is not registered ${FEE_TOKEN} as fee token`
      )
    }
  } else {
    console.error(`FEE_TOKEN: ${FEE_TOKEN} is not supported`)
  }
}

try {
  main()
} catch (error) {
  console.log(error)
}