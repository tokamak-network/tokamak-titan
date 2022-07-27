/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'

/* Imports: Internal */
import { deployAndRegister } from '../src/deploy-utils'

const deployFn: DeployFunction = async (hre) => {
  await deployAndRegister({
    hre,
    name: 'L1TokamakToken',
    contract: 'TOKAMAK',
    args: [],
  })
}

deployFn.tags = ['L1TokamakToken']

export default deployFn
