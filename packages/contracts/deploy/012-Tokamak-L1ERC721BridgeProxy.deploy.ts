import { DeployFunction } from 'hardhat-deploy/dist/types'

import { deployAndVerifyAndThen } from '../src/deploy-utils'
import { names } from '../src/address-names'

const deployFn: DeployFunction = async (hre) => {
  const { deployer } = await hre.getNamedAccounts()

  await deployAndVerifyAndThen({
    hre,
    name: names.managed.contracts.L1ERC721BridgeProxy,
    contract: 'L1ChugSplashProxy',
    iface: 'L1ERC721Bridge',
    args: [deployer], // admin account
  })
}

deployFn.tags = ['L1ERC721BridgeProxy', 'setup', 'l1']

export default deployFn
