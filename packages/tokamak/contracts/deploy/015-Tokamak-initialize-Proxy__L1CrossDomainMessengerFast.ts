/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { hexStringEquals, awaitCondition } from '@eth-optimism/core-utils'

/* Imports: Internal */
import { getContractFromArtifact } from '../src/deploy-utils'
import { names } from '../src/address-names'

const deployFn: DeployFunction = async (hre) => {
  const { deployer } = await hre.getNamedAccounts()

  const Proxy__L1CrossDomainMessengerFast = await getContractFromArtifact(
    hre,
    names.managed.contracts.Proxy__L1CrossDomainMessengerFast,
    {
      iface: 'L1CrossDomainMessengerFast',
      signerOrProvider: deployer,
    }
  )

  const Lib_AddressManager = await getContractFromArtifact(
    hre,
    names.unmanaged.Lib_AddressManager
  )

  console.log(`Initializing Proxy__L1CrossDomainMessengerFast...`)
  await Proxy__L1CrossDomainMessengerFast.initialize(Lib_AddressManager.address)

  console.log(`Checking that contract was correctly initialized...`)
  await awaitCondition(
    async () => {
      return hexStringEquals(
        await Proxy__L1CrossDomainMessengerFast.libAddressManager(),
        Lib_AddressManager.address
      )
    },
    5000,
    100
  )

  console.log(`Setting Proxy__L1CrossDomainMessengerFast owner...`)
  const owner = hre.deployConfig.ovmAddressManagerOwner
  await Proxy__L1CrossDomainMessengerFast.transferOwnership(owner)

  console.log(`Checking that the contract owner was correctly set...`)
  await awaitCondition(
    async () => {
      return hexStringEquals(
        await Proxy__L1CrossDomainMessengerFast.owner(),
        owner
      )
    },
    5000,
    100
  )
}

deployFn.tags = ['finalize', 'Proxy__L1CrossDomainMessengerFast']

export default deployFn
