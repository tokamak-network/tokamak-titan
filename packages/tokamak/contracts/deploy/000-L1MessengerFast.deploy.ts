import { getContractFactory } from '@eth-optimism/contracts'
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory } from 'ethers'
import { sleep, hexStringEquals } from '@eth-optimism/core-utils'

/* eslint-disable */
require('dotenv').config()

import L1_MessengerFastJson from '../artifacts/contracts/L1CrossDomainMessengerFast.sol/L1CrossDomainMessengerFast.json'

let Factory__L1_MessengerFast: ContractFactory
let L1_MessengerFast: Contract

const waitUntilTrue = async (
  check: () => Promise<boolean>,
  opts: {
    retries?: number
    delay?: number
  } = {}
) => {
  opts.retries = opts.retries || 100
  opts.delay = opts.delay || 5000

  let retries = 0
  while (!(await check())) {
    if (retries > opts.retries) {
      throw new Error(`check failed after ${opts.retries} attempts`)
    }
    retries++
    await sleep(opts.delay)
  }
}

// register deployed contract address on address manager
export const registerAddress = async (
  addressManager: any,
  name: string,
  address: string
): Promise<void> => {

  const currentAddress = await addressManager.getAddress(name)
  if (address === currentAddress) {
    console.log(
      `✓ Not registering address for ${name} because it's already been correctly registered`
    )
    return
  }

  console.log(`Registering address for ${name} to ${address}...`)
  await addressManager.setAddress(name, address)

  console.log(`Waiting for registration to reflect on-chain...`)
  await waitUntilTrue(async () => {
    return hexStringEquals(await addressManager.getAddress(name), address)
  })

  console.log(`✓ Registered address for ${name}`)
}

const deployFn: DeployFunction = async (hre) => {

  // check network
  const network = (hre as any).deployConfig.network
  console.log('network: ', network)

  const addressManager = getContractFactory('Lib_AddressManager')
    .connect((hre as any).deployConfig.deployer_l1)
    .attach(process.env.ADDRESS_MANAGER_ADDRESS) as any

  // get factory of L1CrossDomainMessageFast contract for deployment
  Factory__L1_MessengerFast = new ContractFactory(
    L1_MessengerFastJson.abi,
    L1_MessengerFastJson.bytecode,
    (hre as any).deployConfig.deployer_l1
  )

  // deploy L1CrossDomainMessengerFast
  L1_MessengerFast = await Factory__L1_MessengerFast.deploy()

  await L1_MessengerFast.deployTransaction.wait()

  // DeploymentSubmission: define type in hardhat-deploy package
  const L1_MessengerDeploymentSubmission: DeploymentSubmission = {
    ...L1_MessengerFast,
    receipt: L1_MessengerFast.receipt,
    address: L1_MessengerFast.address,
    abi: L1_MessengerFast.abi,
  }

  // set L1CrossDomainMessengerFast address in address manager
  await registerAddress(addressManager, 'L1CrossDomainMessengerFast', L1_MessengerFast.address)

  // save deployment info
  await hre.deployments.save('L1CrossDomainMessengerFast',L1_MessengerDeploymentSubmission)
  console.log(`L1CrossDomainMessengerFast deployed to: ${L1_MessengerFast.address}`)

  const L1_Messenger_Deployed = await Factory__L1_MessengerFast.attach(
    L1_MessengerFast.address
  )

  // initialize L1CrossDomainMessengerFast
  const L1MessagerFastTX = await L1_Messenger_Deployed.initialize(
    addressManager.address
  )
  await L1MessagerFastTX.wait()
  console.log(`L1CrossDomainMessengerFast initialized: ${L1MessagerFastTX.hash}`)

}

deployFn.tags = ['FastMessenger', 'required']

export default deployFn
