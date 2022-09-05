/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'

/* Imports: Internal */
import { deployAndRegister, isHardhatNode } from '../src/deploy-utils'

const deployFn: DeployFunction = async (hre) => {
  // Only execute this step if we're on the hardhat chain ID.
  if (await isHardhatNode(hre)) {
    await deployAndRegister({
      hre,
      name: 'L1TonToken',
      contract: 'TON',
      args: [],
    })
  }
}

deployFn.tags = ['L1TonToken']

export default deployFn
