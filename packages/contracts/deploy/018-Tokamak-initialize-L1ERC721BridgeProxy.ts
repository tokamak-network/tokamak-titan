/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { hexStringEquals, awaitCondition } from '@eth-optimism/core-utils'

/* Imports: Internal */
import { predeploys } from '../src'
import { getContractFromArtifact } from '../src/deploy-utils'
import { names } from '../src/address-names'

const deployFn: DeployFunction = async (hre) => {
  const { deployer } = await hre.getNamedAccounts()

  const L1ERC721BridgeProxy = await getContractFromArtifact(
    hre,
    names.managed.contracts.L1ERC721BridgeProxy,
    {
      iface: 'L1ERC721Bridge',
      signerOrProvider: deployer,
    }
  )

  const Proxy__OVM_L1CrossDomainMessenger = await getContractFromArtifact(
    hre,
    names.managed.contracts.Proxy__OVM_L1CrossDomainMessenger
  )

  console.log()

  console.log(`Initializing L1ERC721BridgeProxy...`)
  await L1ERC721BridgeProxy.initialize(
    Proxy__OVM_L1CrossDomainMessenger.address,
    predeploys.L2ERC721Bridge
  )

  console.log(`Checking that contract was correctly initialized...`)
  await awaitCondition(
    async () => {
      return hexStringEquals(
        await L1ERC721BridgeProxy.messenger(),
        Proxy__OVM_L1CrossDomainMessenger.address
      )
    },
    5000,
    100
  )
}

deployFn.tags = ['finalize', 'L1ERC721BridgeProxy']

export default deployFn
