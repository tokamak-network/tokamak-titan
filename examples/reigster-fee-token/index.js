const { providers, Wallet, utils, ContractFactory } = require('ethers')
require('dotenv').config()
// const { predeploys, getContractFactory } = require('@eth-optimism/contracts')

const main = async () => {
  const env = process.env
  const L2_NODE_WEB3_URL = env.L2_NODE_WEB3_URL
  const PRIV_KEY = env.PRIV_KEY
  const FEE_TOKEN = env.FEE_TOKEN
  const PROXY__TON_GAS_PRICE_ORACLE_ADDRESS =
    '0x4200000000000000000000000000000000000024'

  // provider
  const l2Provider = new providers.JsonRpcProvider(L2_NODE_WEB3_URL)
  const l2Wallet = new Wallet(PRIV_KEY).connect(l2Provider)

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // console.log(Ton_GasPriceOracle)
  const TonGasPriceOracleArtifact = require('../../packages/contracts/artifacts/contracts/L2/predeploys/Ton_GasPriceOracle.sol/Ton_GasPriceOracle.json')
  const factory__TonGasPriceOracle = new ContractFactory(
    TonGasPriceOracleArtifact.abi,
    TonGasPriceOracleArtifact.bytecode
  )
  const Ton_GasPriceOracle = factory__TonGasPriceOracle
    .attach(PROXY__TON_GAS_PRICE_ORACLE_ADDRESS)
    .connect(l2Wallet)

  if (typeof FEE_TOKEN === 'undefined') {
    console.error(`FEE_TOKEN: ${FEE_TOKEN} is not supported`)
    return null
  }

  if (FEE_TOKEN.toLocaleUpperCase() === 'ETH') {
    // use eth as fee token
    const setEthAsFeeTokenTx = await Ton_GasPriceOracle.useETHAsFeeToken()
    await setEthAsFeeTokenTx.wait()
    await sleep(2000)
    const validateFeeToken = await Ton_GasPriceOracle.tonFeeTokenUsers(
      l2Wallet.address
    )
    if (validateFeeToken === false) {
      console.log(`Now ${l2Wallet.address} is using ${FEE_TOKEN} as fee token`)
    }
  } else if (FEE_TOKEN.toLocaleUpperCase() === 'TON') {
    // use Ton as fee token
    const setTonAsFeeTokenTx = await Ton_GasPriceOracle.useTonAsFeeToken()
    await setTonAsFeeTokenTx.wait()
    await sleep(2000)
    const validateFeeToken = await Ton_GasPriceOracle.tonFeeTokenUsers(
      l2Wallet.address
    )
    if (validateFeeToken === true) {
      console.log(`Now ${l2Wallet.address} is using ${FEE_TOKEN} as fee token`)
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
