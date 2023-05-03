import { DeployFunction } from 'hardhat-deploy/dist/types'
import { hexStringEquals, awaitCondition } from '@eth-optimism/core-utils'

import {
  deployAndVerifyAndThen,
  getContractFromArtifact,
} from '../src/deploy-utils'
import { names } from '../src/address-names'

const deployFn: DeployFunction = async (hre) => {
  const Lib_AddressManager = await getContractFromArtifact(
    hre,
    names.unmanaged.Lib_AddressManager
  )

  await deployAndVerifyAndThen({
    hre,
    name: names.managed.contracts.L1CrossDomainMessengerFast,
    contract: 'L1CrossDomainMessengerFast',
    args: [],
    postDeployAction: async (contract) => {
      console.log(`Initializing L1CrossDomainMessengerFast (implementation)...`)
      await contract.initialize(Lib_AddressManager.address)

      console.log(`Checking that contract was correctly initialized...`)
      await awaitCondition(
        async () => {
          return hexStringEquals(
            await contract.libAddressManager(),
            Lib_AddressManager.address
          )
        },
        5000,
        100
      )

      // Same thing as above, we want to transfer ownership of this contract to the owner of the
      // AddressManager. Not technically necessary but seems like the right thing to do.
      console.log(
        `Transferring ownership of L1CrossDomainMessengerFast (implementation)...`
      )
      const owner = hre.deployConfig.ovmAddressManagerOwner
      await contract.transferOwnership(owner)

      console.log(`Checking that contract owner was correctly set...`)
      await awaitCondition(
        async () => {
          return hexStringEquals(await contract.owner(), owner)
        },
        5000,
        100
      )
    },
  })
}

deployFn.tags = ['L1CrossDomainMessengerFast', 'upgrade']

export default deployFn