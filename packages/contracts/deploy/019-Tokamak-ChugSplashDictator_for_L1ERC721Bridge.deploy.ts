/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { ethers } from 'ethers'

/* Imports: Internal */
import { predeploys } from '../src/predeploys'
import { getContractDefinition } from '../src/contract-defs'
import {
  getContractFromArtifact,
  deployAndVerifyAndThen,
} from '../src/deploy-utils'
import { names } from '../src/address-names'

const deployFn: DeployFunction = async (hre) => {
  const L1ERC721BridgeProxy = await getContractFromArtifact(
    hre,
    'L1ERC721BridgeProxy'
  )

  // Note: if the contract being deployed has immutable values this approach would not work.
  const bridgeArtifact = getContractDefinition('L1ERC721Bridge')
  const bridgeCode = bridgeArtifact.deployedBytecode

  const Proxy__OVM_L1CrossDomainMessenger = await getContractFromArtifact(
    hre,
    names.managed.contracts.Proxy__OVM_L1CrossDomainMessenger
  )

  await deployAndVerifyAndThen({
    hre,
    name: names.unmanaged.ChugSplashDictator_for_L1ERC721Bridge,
    contract: 'ChugSplashDictator',
    args: [
      L1ERC721BridgeProxy.address,
      hre.deployConfig.ovmAddressManagerOwner,
      ethers.utils.keccak256(bridgeCode),
      ethers.utils.hexZeroPad('0x00', 32),
      ethers.utils.hexZeroPad(Proxy__OVM_L1CrossDomainMessenger.address, 32),
      ethers.utils.hexZeroPad('0x01', 32),
      ethers.utils.hexZeroPad(predeploys.L2ERC721Bridge, 32),
    ],
  })
}

deployFn.tags = ['upgrade', 'ChugSplashDictator']

export default deployFn
