/* Imports: External */
import { DeployFunction } from 'hardhat-deploy/dist/types'
import { ethers } from 'ethers'
import { hexStringEquals, awaitCondition } from '@eth-optimism/core-utils'

/* Imports: Internal */
import { getContractDefinition } from '../src/contract-defs'
import {
  getContractFromArtifact,
  deployAndVerifyAndThen,
  isHardhatNode,
} from '../src/deploy-utils'
import { names } from '../src/address-names'
import { predeploys } from '../src/predeploys'

const deployFn: DeployFunction = async (hre) => {
  const { deployer } = await hre.getNamedAccounts()

  const Proxy__OVM_L1CrossDomainMessenger = await getContractFromArtifact(
    hre,
    names.managed.contracts.Proxy__OVM_L1CrossDomainMessenger
  )

  const ChugSplashDictator_for_L1ERC721Bridge = await getContractFromArtifact(
    hre,
    names.unmanaged.ChugSplashDictator_for_L1ERC721Bridge,
    {
      signerOrProvider: deployer,
    }
  )

  const L1ERC721BridgeProxy = await getContractFromArtifact(
    hre,
    names.managed.contracts.L1ERC721BridgeProxy,
    {
      iface: 'L1ChugSplashProxy',
      signerOrProvider: deployer,
    }
  )

  // Make sure the dictator has been initialized with the correct bridge code.
  const bridgeArtifact = getContractDefinition('L1ERC721Bridge')
  const bridgeCode = bridgeArtifact.deployedBytecode
  const codeHash = await ChugSplashDictator_for_L1ERC721Bridge.codeHash()
  if (ethers.utils.keccak256(bridgeCode) !== codeHash) {
    throw new Error('code hash does not match actual bridge code')
  }

  const currentOwner = await L1ERC721BridgeProxy.connect(
    L1ERC721BridgeProxy.signer.provider
  ).callStatic.getOwner({
    from: ethers.constants.AddressZero,
  })
  const finalOwner = await ChugSplashDictator_for_L1ERC721Bridge.finalOwner()

  const messengerSlotKey =
    await ChugSplashDictator_for_L1ERC721Bridge.messengerSlotKey()
  const messengerSlotVal =
    await ChugSplashDictator_for_L1ERC721Bridge.messengerSlotVal()
  const bridgeSlotKey =
    await ChugSplashDictator_for_L1ERC721Bridge.bridgeSlotKey()
  const bridgeSlotVal =
    await ChugSplashDictator_for_L1ERC721Bridge.bridgeSlotVal()

  console.log(`
    The ChugSplashDictator contract (glory to Arstotzka) has been deployed.

    FOLLOW THESE INSTRUCTIONS CAREFULLY!

    (1) Review the storage key/value pairs below and make sure they match the expected values:

        ${messengerSlotKey}:   ${messengerSlotVal}
        ${bridgeSlotKey}:   ${bridgeSlotVal}

    (2) Review the CURRENT and FINAL proxy owners and verify that these are the expected values:

        Current proxy owner: (${currentOwner})
        Final proxy owner:   (${finalOwner})

        [${
          currentOwner === finalOwner
            ? 'THESE ARE THE SAME ADDRESSES'
            : 'THESE ARE >>>NOT<<< THE SAME ADDRESSES'
        }]

    (3) Transfer ownership of the L1ChugSplashProxy located at (${
      L1ERC721BridgeProxy.address
    })
        to the ChugSplashDictator contract located at the following address:

        TRANSFER OWNERSHIP TO THE FOLLOWING ADDRESS ONLY:
        >>>>> (${ChugSplashDictator_for_L1ERC721Bridge.address}) <<<<<

    (4) Wait for the deploy process to continue.
  `)

  // Check if if we're on the hardhat chain ID. This will only happen in CI. If this is the case, we
  // can skip directly to transferring ownership over to the ChugSplashDictator contract.
  if (
    (await isHardhatNode(hre)) ||
    process.env.AUTOMATICALLY_TRANSFER_OWNERSHIP === 'true'
  ) {
    const owner = await hre.ethers.getSigner(currentOwner)
    await L1ERC721BridgeProxy.connect(owner).setOwner(
      ChugSplashDictator_for_L1ERC721Bridge.address
    )
  }

  // Wait for ownership to be transferred to the AddressDictator contract.
  await awaitCondition(
    async () => {
      return hexStringEquals(
        await L1ERC721BridgeProxy.connect(
          L1ERC721BridgeProxy.signer.provider
        ).callStatic.getOwner({
          from: ethers.constants.AddressZero,
        }),
        ChugSplashDictator_for_L1ERC721Bridge.address
      )
    },
    30000,
    1000
  )

  // Set the addresses!
  console.log('Ownership successfully transferred. Invoking doActions...')
  console.log('--- L1ERC721Bridge Bytecode ---')
  console.log(bridgeCode)
  console.log('---')
  const res = await ChugSplashDictator_for_L1ERC721Bridge.doActions(bridgeCode)
  console.log(`Check transaction was failed: ${res.hash}`)
  console.log(
    'If the tx was failed, please execute doActions method of ChugSplashDictator.'
  )
  console.log(
    `ChugSplashDictator_for_L1ERC721Bridge.address: ${ChugSplashDictator_for_L1ERC721Bridge.address}`
  )

  console.log(`Confirming that owner address was correctly set...`)
  await awaitCondition(
    async () => {
      return hexStringEquals(
        await L1ERC721BridgeProxy.connect(
          L1ERC721BridgeProxy.signer.provider
        ).callStatic.getOwner({
          from: ethers.constants.AddressZero,
        }),
        finalOwner
      )
    },
    5000,
    100
  )

  // Deploy a copy of the implementation so it can be successfully verified on Etherscan.
  console.log(`Deploying a copy of the bridge for Etherscan verification...`)
  await deployAndVerifyAndThen({
    hre,
    name: 'L1ERC721Bridge_for_verification_only',
    contract: 'L1ERC721Bridge',
    args: [
      Proxy__OVM_L1CrossDomainMessenger.address,
      predeploys.L2ERC721Bridge,
    ],
  })
}

deployFn.tags = ['L1ERC721Bridge', 'upgrade']

export default deployFn
