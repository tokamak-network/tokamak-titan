const {
  ContractFactory,
  providers,
  Wallet,
  utils,
  BigNumber,
} = require('ethers')
const { serialize } = require('@ethersproject/transactions')
require('dotenv').config()

const main = async () => {
  const env = process.env
  const L2_NODE_WEB3_URL = env.L2_NODE_WEB3_URL
  const PRIV_KEY = env.PRIV_KEY
  const FEE_TOKEN = env.FEE_TOKEN

  // get provider
  const l2Provider = new providers.JsonRpcProvider(L2_NODE_WEB3_URL)
  const l2Wallet = new Wallet(PRIV_KEY).connect(l2Provider)
  const PROXY__TOKAMAK_GAS_PRICE_ORACLE_ADDRESS =
    '0x4200000000000000000000000000000000000024'
  const L2_TOKAMAK_ADDRESS = '0x4200000000000000000000000000000000000023'
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

  const TokamakGasPriceOracleArtifact = require('../../packages/contracts/artifacts/contracts/L2/predeploys/Tokamak_GasPriceOracle.sol/Tokamak_GasPriceOracle.json')
  const factory__TokamakGasPriceOracle = new ContractFactory(
    TokamakGasPriceOracleArtifact.abi,
    TokamakGasPriceOracleArtifact.bytecode
  )
  const Tokamak_GasPriceOracle = factory__TokamakGasPriceOracle
    .attach(PROXY__TOKAMAK_GAS_PRICE_ORACLE_ADDRESS)
    .connect(l2Wallet)

  // load L2Tokamak contract
  const l2StandardERC20 = require('../../packages/contracts/artifacts/contracts/standards/L2StandardERC20.sol/L2StandardERC20.json')
  const factory__L2StandardERC20 = new ContractFactory(
    l2StandardERC20.abi,
    l2StandardERC20.bytecode
  )
  const L2Tokamak = factory__L2StandardERC20
    .attach(L2_TOKAMAK_ADDRESS)
    .connect(l2Wallet)

  if (typeof FEE_TOKEN === 'undefined') {
    console.error(`FEE_TOKEN: ${FEE_TOKEN} is not supported`)
    return null
  }
  // check
  const isTokamakAsFeeToken = await Tokamak_GasPriceOracle.tokamakFeeTokenUsers(
    l2Wallet.address
  )

  // 1. ETH as fee token
  if (FEE_TOKEN.toLocaleUpperCase() === 'ETH') {
    // send tx (transfer TOKAMAK)
    if (isTokamakAsFeeToken === false) {
      const amount = utils.parseEther('1')
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
        const json = await l2Provider.send('eth_getTransactionReceipt', [
          tx.hash,
        ])
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
        l2Fee = receipt.gasUsed.mul(tx.gasPrice)
        console.log('L1Fee: ', utils.formatEther(BigNumber.from(json.l1Fee)))
        console.log('L2Fee: ', utils.formatEther(l2Fee))
      }
    } else {
      console.log(
        `The address ${l2Wallet.address} is not registered ${FEE_TOKEN} as fee token`
      )
    }
  }
  // 2. TOKAMAK as fee token
  else if (FEE_TOKEN.toLocaleUpperCase() === 'TOKAMAK') {
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

      const raw = serialize({
        nonce: parseInt(unsigned.nonce.toString(10), 10),
        value: unsigned.value,
        gasPrice: unsigned.gasPrice,
        gasLimit: unsigned.gasLimit,
        to: unsigned.to,
        data: unsigned.data,
      })

      // get l1 fee
      const l1Fee = await Ovm_GasPriceOracle.connect(l2Wallet).getL1Fee(raw)
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
      }

      const priceRatio = await Tokamak_GasPriceOracle.priceRatio()
      const L1TokamakFee = l1Fee.mul(priceRatio)
      const L2TokamakFee = receipt.gasUsed.mul(tx.gasPrice).mul(priceRatio)

      console.log('L1TokamakFee: ', utils.formatEther(L1TokamakFee))
      console.log('L2TokamakFee: ', utils.formatEther(L2TokamakFee))
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
