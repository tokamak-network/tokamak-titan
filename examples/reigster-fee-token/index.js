const {
  Contract,
  providers,
  Wallet,
  utils,
  ContractFactory,
} = require('ethers')
require('dotenv').config()

const main = async () => {
  const env = process.env
  const L1_NODE_WEB3_URL = env.L1_NODE_WEB3_URL
  const L2_NODE_WEB3_URL = env.L2_NODE_WEB3_URL
  const PRIV_KEY = env.PRIV_KEY

  const FEE_TOKEN = env.FEE_TOKEN

  const TOKAMAK_GAS_PRICE_ORACLE_ADDRESS =
    '0x4200000000000000000000000000000000000025'

  // provider
  const l1Provider = new providers.JsonRpcProvider(L1_NODE_WEB3_URL)
  const l2Provider = new providers.JsonRpcProvider(L2_NODE_WEB3_URL)
  const l1Wallet = new Wallet(PRIV_KEY).connect(l1Provider)
  const l2Wallet = new Wallet(PRIV_KEY).connect(l2Provider)

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  const TokamakGasPriceOracleArtifact = require('../../packages/contracts/artifacts/contracts/L2/predeploys/Tokamak_GasPriceOracle.sol/Tokamak_GasPriceOracle.json')
  const factory__TokamakGasPriceOracle = new ContractFactory(
    TokamakGasPriceOracleArtifact.abi,
    TokamakGasPriceOracleArtifact.bytecode
  )
  const Tokamak_GasPriceOracle = factory__TokamakGasPriceOracle
    .attach(TOKAMAK_GAS_PRICE_ORACLE_ADDRESS)
    .connect(l2Wallet)

  const isTokamakAsFeeToken = await Tokamak_GasPriceOracle.tokamakFeeTokenUsers(
    l2Wallet.address
  )

  if (typeof FEE_TOKEN === 'undefined') {
    console.error(`FEE_TOKEN: ${FEE_TOKEN} is not supported`)
    return null
  }

  if (FEE_TOKEN.toLocaleUpperCase() === 'ETH') {
    // use eth as fee token
    if (isTokamakAsFeeToken === true) {
      const setEthAsFeeTokenTx = await Tokamak_GasPriceOracle.useETHAsFeeToken()
      await setEthAsFeeTokenTx.wait()
    }
    await sleep(2000)
    const validateFeeToken = await Tokamak_GasPriceOracle.tokamakFeeTokenUsers(
      l2Wallet.address
    )
    if (validateFeeToken === false) {
      console.log(`Now ${l2Wallet.address} is using ${FEE_TOKEN} as fee token`)
    }
  } else if (FEE_TOKEN.toLocaleUpperCase() === 'TOKAMAK') {
    if (isTokamakAsFeeToken === false) {
      // use Tokamak as fee token
      const setTokamakAsFeeTokenTx =
        await Tokamak_GasPriceOracle.useTokamakAsFeeToken()
      await setTokamakAsFeeTokenTx.wait()
    }
    await sleep(2000)
    const validateFeeToken = await Tokamak_GasPriceOracle.tokamakFeeTokenUsers(
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
