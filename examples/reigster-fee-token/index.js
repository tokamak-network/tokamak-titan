const { Contract, providers, Wallet, utils } = require('ethers')
require('dotenv').config()

const main = async () => {
  const env = process.env
  const L1_NODE_WEB3_URL = env.L1_NODE_WEB3_URL
  const L2_NODE_WEB3_URL = env.L2_NODE_WEB3_URL
  const ADDRESS_MANAGER_ADDRESS = env.ADDRESS_MANAGER_ADDRESS
  const PRIV_KEY = env.PRIV_KEY

  const FEE_TOKEN = env.FEE_TOKEN

  // provider
  const l1Provider = new providers.JsonRpcProvider(L1_NODE_WEB3_URL)
  const l2Provider = new providers.JsonRpcProvider(L2_NODE_WEB3_URL)
  const l1Wallet = new Wallet(PRIV_KEY).connect(l1Provider)
  const l2Wallet = new Wallet(PRIV_KEY).connect(l2Provider)

  // load contract
  const addressManagerInterface = new utils.Interface([
    'function getAddress(string _name) view returns (address address)',
  ])
  const addressManager = new Contract(
    ADDRESS_MANAGER_ADDRESS,
    addressManagerInterface,
    l1Wallet
  )

  // get address
  const TokamakGasPriceOracleAddress = await addressManager.getAddress(
    'Tokamak_GasPriceOracle'
  )

  const TokamakGasPriceOracleInterface = new utils.Interface([
    'function useTokamakAsFeeToken()',
    'function useETHAsFeeToken()',
    'function tokamakFeeTokenUsers(address) view returns (bool)',
  ])
  const Tokamak_GasPriceOracle = new Contract(
    TokamakGasPriceOracleAddress,
    TokamakGasPriceOracleInterface,
    l2Wallet
  )

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
    const validateFeeToken = await Tokamak_GasPriceOracle.tokamakFeeTokenUsers(
      l2Wallet.address
    )
    console.log(`isEthAsFeeToken: ${validateFeeToken}`)
  } else if (FEE_TOKEN.toLocaleUpperCase() === 'TOKAMAK') {
    if (isTokamakAsFeeToken === false) {
      // use Tokamak as fee token
      const setTokamakAsFeeTokenTx =
        await Tokamak_GasPriceOracle.useTokamakAsFeeToken()
      await setTokamakAsFeeTokenTx.wait()
    }
    const validateFeeToken = await Tokamak_GasPriceOracle.tokamakFeeTokenUsers(
      l2Wallet.address
    )
    console.log(`isTokamakAsFeeToken: ${validateFeeToken}`)
  } else {
    console.error(`FEE_TOKEN: ${FEE_TOKEN} is not supported`)
  }
}

try {
  main()
} catch (error) {
  console.log(error)
}
