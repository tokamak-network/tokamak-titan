/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'

/* Imports: Internal */
import { deployAndRegister } from '../src/hardhat-deploy-ethers'

const deployFn: DeployFunction = async (hre) => {
  await deployAndRegister({
    hre,
    name: 'TK_L1TOKAMAK',
    contract: 'TOKAMAK',
    args: [],
  })
}

deployFn.tags = ['L1TokamakToken']

export default deployFn
