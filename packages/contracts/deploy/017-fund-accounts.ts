/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { defaultHardhatNetworkHdAccountsConfigParams } from 'hardhat/internal/core/config/default-config'
import { normalizeHardhatNetworkAccountsConfig } from 'hardhat/internal/core/providers/util'

// eslint-disable-next-line import/order
import { predeploys } from '../src/predeploys'
/* Imports: Internal */
import { getContractFromArtifact, isHardhatNode } from '../src/deploy-utils'
import { names } from '../src/address-names'

// This is a TEMPORARY way to fund the default hardhat accounts on L2. The better way to do this is
// to make a modification to hardhat-ovm. However, I don't have the time right now to figure the
// details of how to make that work cleanly. This is fine in the meantime.
const deployFn: DeployFunction = async (hre) => {
  // Only execute this step if we're on the hardhat chain ID.
  if (await isHardhatNode(hre)) {
    // get Proxy__OVM_L1StandardBridge contract
    const L1StandardBridge = await getContractFromArtifact(
      hre,
      names.managed.contracts.Proxy__OVM_L1StandardBridge,
      {
        iface: 'L1StandardBridge',
      }
    )

    const L1TokamakToken = await hre.deployments.get('TK_L1TOKAMAK')
    console.log('L1TokamakToken: ', JSON.stringify(L1TokamakToken, null, 4))
    // const balance = await hre.ethers.provider.getBalance(L1TokamakToken.address)
    // console.log('L1 contract balance: ', balance)

    // Default has 20 accounts but we restrict to 20 accounts manually as well just to prevent
    // future problems if the number of default accounts increases for whatever reason.
    const accounts = normalizeHardhatNetworkAccountsConfig(
      defaultHardhatNetworkHdAccountsConfigParams
    ).slice(0, 20)

    // console.log('accounts: ', accounts)
    // first l1 account
    const TokamakHolder = new hre.ethers.Wallet(
      accounts[0].privateKey,
      hre.ethers.provider
    )
    console.log('TokamakHolder: ', JSON.stringify(TokamakHolder, null, 4))
    // console.log('balance of TokamakHolder: ', TokamakHolder.getBalance())

    for (const account of accounts) {
      // console.log('acccount: ', JSON.stringify(account, null, 4))
      const wallet = new hre.ethers.Wallet(
        account.privateKey,
        hre.ethers.provider
      )
      // console.log('wallet: ', JSON.stringify(wallet, null, 4))
      const balance = await wallet.getBalance()
      // console.log('balance: ', JSON.stringify(balance, null, 4))
      const depositAmount = balance.div(2) // Deposit half of the wallet's balance into L2.
      const fundETHTx = await L1StandardBridge.connect(wallet).depositETH(
        8_000_000,
        '0x',
        {
          value: depositAmount,
          gasLimit: 2_000_000, // Idk, gas estimation was broken and this fixes it.
        }
      )
      // console.log('fundETHTx: ', JSON.stringify(fundETHTx, null, 4))

      await fundETHTx.wait()
      console.log(
        `✓ Funded ${wallet.address} on L2 with ${hre.ethers.utils.formatEther(
          depositAmount
        )} ETH`
      )

      // deposit 5000 TOKAMAK to each L2 address
      const depositTokamakAmount = hre.ethers.utils.parseEther('5000')
      // console.log(
      //   'depositTokamakAmount: ',
      //   JSON.stringify(depositTokamakAmount, null, 4)
      // )
      const L2TokamakAddress = predeploys.L2StandardERC20
      // ERC20 approve
      // const approveTx = await L1TokamakToken.connect(TokamakHolder).approve(
      //   L1StandardBridge.address,
      //   depositTokamakAmount
      // )
      // console.log('approveTx: ', JSON.stringify(approveTx, null, 4))
      // await approveTx.wait()
      // deposit TOKAMAK
      const fundTokamakTx = await L1StandardBridge.connect(
        TokamakHolder
      ).depositERC20To(
        L1TokamakToken.address,
        L2TokamakAddress,
        wallet.address,
        depositTokamakAmount,
        8_000_000,
        '0x',
        { gasLimit: 2_000_000 } // Idk, gas estimation was broken and this fixes it.
      )
      // console.log('fundTokamakTx: ', JSON.stringify(fundTokamakTx, null, 4))
      await fundTokamakTx.wait()
      console.log(`✓ Funded ${wallet.address} on L2 with 5000.0 TOKAMAK`)
    }
  }
}

deployFn.tags = ['fund-accounts']

export default deployFn
