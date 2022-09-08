/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'

/* Imports: Internal */
import { deployAndRegister } from '../src/deploy-utils'

const deployFn: DeployFunction = async (hre) => {
  await deployAndRegister({
    hre,
    name: 'L1TonToken',
    contract: 'TON',
    args: [],
  })
}

deployFn.tags = ['L1TonToken']

export default deployFn