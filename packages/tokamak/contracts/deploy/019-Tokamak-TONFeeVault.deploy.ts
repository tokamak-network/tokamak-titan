/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'

/* Imports: Internal */
import { deployAndVerifyAndThen, isHardhatNode } from '../src/deploy-utils'

const deployFn: DeployFunction = async (hre) => {
  // Only live network
  if (!await isHardhatNode(hre)) {
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