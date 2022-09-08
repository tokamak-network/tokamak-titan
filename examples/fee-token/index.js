const {
  ContractFactory,
  providers,
  Wallet,
  utils,
  BigNumber,
} = require('ethers')
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

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // load Ton_GasPriceOracle contract
  const TonGasPriceOracleArtifact = require('./artifacts/Ton_GasPriceOracle.sol/Ton_GasPriceOracle.json')
  const factory__TonGasPriceOracle = new ContractFactory(
    TonGasPriceOracleArtifact.abi,
    TonGasPriceOracleArtifact.bytecode
  )
  const Ton_GasPriceOracle = factory__TonGasPriceOracle
    .attach(PROXY__TON_GAS_PRICE_ORACLE_ADDRESS)
    .connect(l2Wallet)

  // load L2Ton contract
  const l2StandardERC20 = require('./artifacts/L2StandardERC20.sol/L2StandardERC20.json')
  const factory__L2StandardERC20 = new ContractFactory(
    l2StandardERC20.abi,
    l2StandardERC20.bytecode
  )
  const L2Ton = factory__L2StandardERC20
    .attach(L2_TON_ADDRESS)
    .connect(l2Wallet)

  // check typeof arguments
  if (typeof FEE_TOKEN === 'undefined') {
    console.error(`FEE_TOKEN: ${FEE_TOKEN} is not supported`)
    return null
  }

  // use ETH as fee token
  if (FEE_TOKEN.toLocaleUpperCase() === 'ETH') {
    const setEthAsFeeTokenTx = await Ton_GasPriceOracle.useETHAsFeeToken()
    await setEthAsFeeTokenTx.wait()
    await sleep(2000)
    const validateFeeToken = await Ton_GasPriceOracle.tonFeeTokenUsers(
      l2Wallet.address
    )
    if (validateFeeToken === false) {
      console.log(`Now ${l2Wallet.address} is using ${FEE_TOKEN} as fee token`)
      await sleep(3000)

      // send 1 TON
      const amount = utils.parseEther('1')
      const other = '0x1234123412341234123412341234123412341234'
      const ETHBalanceBefore = await l2Wallet.getBalance()
      const TonBalanceBefore = await L2Ton.balanceOf(l2Wallet.address)

      console.log(`ETH balance: ${utils.formatEther(ETHBalanceBefore)} ETH`)
      console.log(`TON balance: ${utils.formatEther(TonBalanceBefore)} TON`)

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

        const usedETH = ETHBalanceBefore.sub(ETHBalanceAfter)
        const usedTON = TonBalanceBefore.sub(TonBalanceAfter)
        console.log(`Change in ETH balance: ${utils.formatEther(usedETH)} ETH`)
        console.log(`Change in TON balance: ${utils.formatEther(usedTON)} TON`)
        TxFee = receipt.gasUsed.mul(tx.gasPrice)
        console.log(`TxFee: ${utils.formatEther(TxFee)} ${FEE_TOKEN}`)
      }
    }
  }
  // use TON as fee token
  else if (FEE_TOKEN.toLocaleUpperCase() === 'TON') {
    const setTonAsFeeTokenTx = await Ton_GasPriceOracle.useTonAsFeeToken()
    await setTonAsFeeTokenTx.wait()
    await sleep(2000)
    const validateFeeToken = await Ton_GasPriceOracle.tonFeeTokenUsers(
      l2Wallet.address
    )
    if (validateFeeToken === true) {
      console.log(`Now ${l2Wallet.address} is using ${FEE_TOKEN} as fee token`)
      await sleep(3000)

      // send 0.01 ETH
      const amount = utils.parseEther('0.01')
      const other = '0x1234123412341234123412341234123412341234'
      const ETHBalanceBefore = await l2Wallet.getBalance()
      const TonBalanceBefore = await L2Ton.balanceOf(l2Wallet.address)

      console.log(`ETH balance: ${utils.formatEther(ETHBalanceBefore)} ETH`)
      console.log(`TON balance: ${utils.formatEther(TonBalanceBefore)} TON`)

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

        const usedETH = ETHBalanceBefore.sub(ETHBalanceAfter)
        const usedTON = TonBalanceBefore.sub(TonBalanceAfter)
        console.log(`Change in ETH balance: ${utils.formatEther(usedETH)} ETH`)
        console.log(`Change in TON balance: ${utils.formatEther(usedTON)} TON`)
        const priceRatio = await Ton_GasPriceOracle.priceRatio()
        const TxFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

        console.log(`TxFee: ${utils.formatEther(TxFee)} ${FEE_TOKEN}`)
      }
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
