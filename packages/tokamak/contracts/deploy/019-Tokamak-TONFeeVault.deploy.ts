/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'

/* Imports: Internal */
import { deployAndVerifyAndThen, isHardhatNode } from '../src/deploy-utils'

const liveNetworks: number[] = [55004, 5050, 5051]

const deployFn: DeployFunction = async (hre) => {
  // Only live network
  if (!await isHardhatNode(hre) && liveNetworks.includes(hre.network.config.chainId)) {
    console.log('deploy TON_FeeVault')
    await deployAndVerifyAndThen({
      hre,
      name: 'L2TONFeeVault',
      contract: 'TON_FeeVault',
      args: [],
    })
  }
}

deployFn.tags = ['L2TONFeeVault', 'l2']

export default deployFn