/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'

import '@eth-optimism/hardhat-deploy-config'
import '@nomiclabs/hardhat-ethers'
import 'hardhat-deploy'
import { deployAndVerifyAndThen } from '../src/deploy-utils'

const deployFn: DeployFunction = async (hre) => {
  const { deployer } = await hre.getNamedAccounts()

  console.log(`Deploying L1ERC721BridgeProxy to ${hre.network.name}`)
  console.log(`Using deployer ${deployer}`)

  await deployAndVerifyAndThen({
    hre,
    name: 'L1ERC721BridgeProxy',
    contract: 'Proxy',
    iface: 'L1ERC721Bridge',
    args: [deployer],
  })

  const Deployment__L1ERC721BridgeProxy = await hre.deployments.get(
    'L1ERC721BridgeProxy'
  )
  console.log(
    `L1ERC721BridgeProxy deployed to ${Deployment__L1ERC721BridgeProxy.address}`
  )

  const L1ERC721BridgeProxy = await hre.ethers.getContractAt(
    'Proxy',
    Deployment__L1ERC721BridgeProxy.address
  )

  const Deployment__L1ERC721Bridge = await hre.deployments.get('L1ERC721Bridge')

  {
    // Set the implementation address in the proxy contract
    const tx = await L1ERC721BridgeProxy.upgradeTo(
      Deployment__L1ERC721Bridge.address
    )
    const receipt = await tx.wait()
    console.log(
      `L1ERC721BridgeProxy set the implementation: ${receipt.transactionHash}`
    )
  }

  {
    // Set the admin correctly
    const newAdmin = deployer
    const tx = await L1ERC721BridgeProxy.changeAdmin(newAdmin)
    const receipt = await tx.wait()
    console.log(`L1ERC721BridgeProxy admin updated: ${receipt.transactionHash}`)
  }
}

deployFn.tags = ['L1ERC721BridgeProxy']

export default deployFn
