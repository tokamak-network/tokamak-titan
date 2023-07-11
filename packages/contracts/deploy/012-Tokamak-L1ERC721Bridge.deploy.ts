/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'

import '@eth-optimism/hardhat-deploy-config'
import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'

import { predeploys } from '../src'
import {
  validateERC721Bridge,
  deployAndVerifyAndThen,
  getContractFromArtifact,
} from '../src/deploy-utils'
import { names } from '../src/address-names'

const deployFn: DeployFunction = async (hre) => {
  const { deployer } = await hre.getNamedAccounts()

  console.log(`Deploying L1ERC721Bridge to ${hre.network.name}`)
  console.log(`Using deployer ${deployer}`)

  const Proxy__OVM_L1CrossDomainMessenger = await getContractFromArtifact(
    hre,
    names.managed.contracts.Proxy__OVM_L1CrossDomainMessenger
  )

  // Deploy the L1ERC721Bridge. The arguments are
  // - messenger
  // - otherBridge
  // Since this is the L1ERC721Bridge, the otherBridge is the
  // predeploy address
  await deployAndVerifyAndThen({
    hre,
    name: 'L1ERC721Bridge',
    args: [
      Proxy__OVM_L1CrossDomainMessenger.address,
      predeploys.L2ERC721Bridge,
    ],
  })

  const Deployment__L1ERC721Bridge = await hre.deployments.get('L1ERC721Bridge')
  console.log(
    `L1ERC721Bridge deployed to ${Deployment__L1ERC721Bridge.address}`
  )

  await validateERC721Bridge(hre, Deployment__L1ERC721Bridge.address, {
    messenger: Proxy__OVM_L1CrossDomainMessenger.address,
    otherBridge: predeploys.L2ERC721Bridge,
  })
}

deployFn.tags = ['L1ERC721BridgeImplementation']

export default deployFn
