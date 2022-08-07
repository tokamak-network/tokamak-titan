const {
  Contract,
  ContractFactory,
  providers,
  Wallet,
  utils,
} = require('ethers')
require('dotenv').config()

const main = async () => {
  const env = process.env
  const L1_NODE_WEB3_URL = env.L1_NODE_WEB3_URL
  const L2_NODE_WEB3_URL = env.L2_NODE_WEB3_URL
  const ADDRESS_MANAGER_ADDRESS = env.ADDRESS_MANAGER_ADDRESS
  const PRIV_KEY = env.PRIV_KEY

  const FEE_TOKEN = env.FEE_TOKEN

  // get provider
  const l1Provider = new providers.JsonRpcProvider(L1_NODE_WEB3_URL)
  const l2Provider = new providers.JsonRpcProvider(L2_NODE_WEB3_URL)
  const l1Wallet = new Wallet(PRIV_KEY).connect(l1Provider)
  const l2Wallet = new Wallet(PRIV_KEY).connect(l2Provider)

  const sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  // load addressManager contract
  const addressManagerInterface = new utils.Interface([
    'function getAddress(string _name) view returns (address address)',
  ])
  const addressManager = new Contract(
    ADDRESS_MANAGER_ADDRESS,
    addressManagerInterface,
    l1Wallet
  )

  // load Tokamak_GasPriceOracle contract
  const TokamakGasPriceOracleAddress = await addressManager.getAddress(
    'Tokamak_GasPriceOracle'
  )
  const TokamakGasPriceOracleArtifact = require('../../packages/contracts/artifacts/contracts/L2/predeploys/Tokamak_GasPriceOracle.sol/Tokamak_GasPriceOracle.json')
  const factory__TokamakGasPriceOracle = new ContractFactory(
    TokamakGasPriceOracleArtifact.abi,
    TokamakGasPriceOracleArtifact.bytecode
  )
  const Tokamak_GasPriceOracle = factory__TokamakGasPriceOracle
    .attach(TokamakGasPriceOracleAddress)
    .connect(l2Wallet)

  // load L2Tokamak contract
  const L2TokamakAddress = await addressManager.getAddress('L2TokamakToken')
  const l2StandardERC20 = require('../../packages/contracts/artifacts/contracts/standards/L2StandardERC20.sol/L2StandardERC20.json')
  const factory__L2StandardERC20 = new ContractFactory(
    l2StandardERC20.abi,
    l2StandardERC20.bytecode
  )
  const L2Tokamak = factory__L2StandardERC20
    .attach(L2TokamakAddress)
    .connect(l2Wallet)

  if (typeof FEE_TOKEN === 'undefined') {
    console.error(`FEE_TOKEN: ${FEE_TOKEN} is not supported`)
    return null
  }

  // 1. ETH as fee token
  if (FEE_TOKEN.toLocaleUpperCase() === 'ETH') {
    // check
    const isTokamakAsFeeToken =
      await Tokamak_GasPriceOracle.tokamakFeeTokenUsers(l2Wallet.address)
    console.log(`isTokamakAsFeeToken: ${isTokamakAsFeeToken}`)

    // send tx (transfer TOKAMAK)
    if (isTokamakAsFeeToken === false) {
      const amount = utils.parseEther('10')
      const other = '0x1234123412341234123412341234123412341234'
      const ETHBalanceBefore = await l2Wallet.getBalance()
      const TokamakBalanceBefore = await L2Tokamak.balanceOf(l2Wallet.address)
      console.log(
        `Balance ETH Before: ${utils.formatEther(ETHBalanceBefore)} ETH`
      )
      console.log(
        `Balance TOKAMAK Before: ${utils.formatEther(
          TokamakBalanceBefore
        )} TOKAMAK`
      )

      const tx = await L2Tokamak.transfer(other, amount)
      console.log('txHash: ', tx.hash)
      const receipt = await tx.wait()
      await sleep(3000)

      if (receipt.status === 1) {
        const ETHBalanceAfter = await l2Wallet.getBalance()
        const TokamakBalanceAfter = await L2Tokamak.balanceOf(l2Wallet.address)

        console.log(
          `Balance ETH After: ${utils.formatEther(ETHBalanceAfter)} ETH`
        )
        console.log(
          `Balance TOKAMAK After: ${utils.formatEther(
            TokamakBalanceAfter
          )} TOKAMAK`
        )

        const usedETH = ETHBalanceBefore.sub(ETHBalanceAfter)
        const usedTOKAMAK = TokamakBalanceBefore.sub(TokamakBalanceAfter)
        console.log(
          'ETHBalanceAfter - ETHBalanceBefore: ',
          utils.formatEther(usedETH)
        )
        console.log(
          'TokamakBalanceAfter - TokamakBalanceBefore: ',
          utils.formatEther(usedTOKAMAK)
        )
        const priceRatio = await Tokamak_GasPriceOracle.priceRatio()
        // tokamakFee = receipt.gasUsed * tx.gasPrice * priceRatio
        const txTokamakFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
        console.log('txTokamakFee: ', utils.formatEther(txTokamakFee))
      }
    } else {
      console.log(
        `The address ${l2Wallet.address} is not registered ${FEE_TOKEN} as fee token`
      )
    }
  }
  // 2. TOKAMAK as fee token
  else if (FEE_TOKEN.toLocaleUpperCase() === 'TOKAMAK') {
    // check
    const isTokamakAsFeeToken =
      await Tokamak_GasPriceOracle.tokamakFeeTokenUsers(l2Wallet.address)
    console.log(`isTokamakAsFeeToken: ${isTokamakAsFeeToken}`)

    // send tx (transfer ETH)
    if (isTokamakAsFeeToken === true) {
      const amount = utils.parseEther('0.01')
      const other = '0x1234123412341234123412341234123412341234'
      const ETHBalanceBefore = await l2Wallet.getBalance()

      const TokamakBalanceBefore = await L2Tokamak.balanceOf(l2Wallet.address)
      console.log(
        `Balance ETH Before: ${utils.formatEther(ETHBalanceBefore)} ETH`
      )
      console.log(
        `Balance TOKAMAK Before: ${utils.formatEther(
          TokamakBalanceBefore
        )} TOKAMAK`
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
        const ETHBalanceAfter = await l2Wallet.getBalance()
        const TokamakBalanceAfter = await L2Tokamak.balanceOf(l2Wallet.address)

        console.log(
          `Balance ETH After: ${utils.formatEther(ETHBalanceAfter)} ETH`
        )
        console.log(
          `Balance TOKAMAK After: ${utils.formatEther(
            TokamakBalanceAfter
          )} TOKAMAK`
        )

        const usedETH = ETHBalanceBefore.sub(ETHBalanceAfter)
        const usedTOKAMAK = TokamakBalanceBefore.sub(TokamakBalanceAfter)
        console.log(
          'ETHBalanceAfter - ETHBalanceBefore: ',
          utils.formatEther(usedETH)
        )
        console.log(
          'TokamakBalanceAfter - TokamakBalanceBefore: ',
          utils.formatEther(usedTOKAMAK)
        )
        const priceRatio = await Tokamak_GasPriceOracle.priceRatio()
        // tokamakFee = receipt.gasUsed * tx.gasPrice * priceRatio
        const txTokamakFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)
        console.log('txTokamakFee: ', utils.formatEther(txTokamakFee))
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
