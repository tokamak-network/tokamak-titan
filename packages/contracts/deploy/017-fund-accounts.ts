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

    const L1TonToken = await getContractFromArtifact(hre, 'L1TonToken')

    // Default has 20 accounts but we restrict to 20 accounts manually as well just to prevent
    // future problems if the number of default accounts increases for whatever reason.
    const accounts = normalizeHardhatNetworkAccountsConfig(
      defaultHardhatNetworkHdAccountsConfigParams
    ).slice(0, 20)

    // first l1 account = deployer
    const TonHolder = new hre.ethers.Wallet(
      accounts[0].privateKey,
      hre.ethers.provider
    )

    for (const account of accounts) {
      const wallet = new hre.ethers.Wallet(
        account.privateKey,
        hre.ethers.provider
      )

      const depositAmount = hre.ethers.utils.parseEther('100')
      // to address is l1 standard bridge address
      const fundETHTx = await L1StandardBridge.connect(wallet).depositETH(
        8_000_000,
        '0x',
        {
          value: depositAmount,
          gasLimit: 2_000_000, // Idk, gas estimation was broken and this fixes it.
        }
      )

      await fundETHTx.wait()
      console.log(
        `✓ Funded ${wallet.address} on L2 with ${hre.ethers.utils.formatEther(
          depositAmount
        )} ETH`
      )

      // deposit 5000 TON to each L2 address
      const depositTonAmount = hre.ethers.utils.parseEther('5000')
      const L2TonAddress = predeploys.L2StandardERC20
      // ERC20 approve
      // to address is l1token address
      const approveTx = await L1TonToken.connect(TonHolder).approve(
        L1StandardBridge.address,
        depositTonAmount
      )
      await approveTx.wait()
      // deposit TON
      // to address is l1 standard bridge address
      const fundTonTx = await L1StandardBridge.connect(
        TonHolder
      ).depositERC20To(
        L1TonToken.address,
        L2TonAddress,
        wallet.address,
        depositTonAmount,
        8_000_000,
        '0x',
        { gasLimit: 2_000_000 } // Idk, gas estimation was broken and this fixes it.
      )
      await fundTonTx.wait()
      console.log(
        `✓ Funded ${wallet.address} on L2 with ${hre.ethers.utils.formatEther(
          depositTonAmount
        )} TON`
      )
    }
  }
}

deployFn.tags = ['fund-accounts']

export default deployFn