import { getContractFactory } from '@eth-optimism/contracts'
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory } from 'ethers'

import { registerAddress } from './000-L1MessengerFast.deploy'

/* eslint-disable */
require('dotenv').config()

import L1_MessengerFastJson from '../artifacts/contracts/L1CrossDomainMessengerFast.sol/L1CrossDomainMessengerFast.json'

let Factory__Proxy_L1_MessengerFast: ContractFactory
let Factory__L1_MessengerFast: ContractFactory
let Proxy_L1_MessengerFast: Contract

const deployFn: DeployFunction = async (hre) => {

  const addressManager = getContractFactory('Lib_AddressManager')
    .connect((hre as any).deployConfig.deployer_l1)
    .attach(process.env.ADDRESS_MANAGER_ADDRESS) as any

  Factory__L1_MessengerFast = new ContractFactory(
    L1_MessengerFastJson.abi,
    L1_MessengerFastJson.bytecode,
    (hre as any).deployConfig.deployer_l1
  )

  Factory__Proxy_L1_MessengerFast = getContractFactory(
    'Lib_ResolvedDelegateProxy',
    (hre as any).deployConfig.deployer_l1
  )

  Proxy_L1_MessengerFast = await Factory__Proxy_L1_MessengerFast.deploy(
    addressManager.address,
    'L1CrossDomainMessengerFast'
  )

  await Proxy_L1_MessengerFast.deployTransaction.wait()

  const Proxy_L1_MessengerDeploymentSubmission: DeploymentSubmission = {
    ...Proxy_L1_MessengerFast,
    receipt: Proxy_L1_MessengerFast.receipt,
    address: Proxy_L1_MessengerFast.address,
    abi: Proxy_L1_MessengerFast.abi,
  }

  await registerAddress(addressManager, 'Proxy__L1CrossDomainMessengerFast', Proxy_L1_MessengerFast.address )
  await hre.deployments.save( 'Proxy__L1CrossDomainMessengerFast', Proxy_L1_MessengerDeploymentSubmission )
  console.log(`Proxy__L1CrossDomainMessengerFast deployed to: ${Proxy_L1_MessengerFast.address}`)

  const Proxy_L1_MessengerFast_Deployed = Factory__L1_MessengerFast.attach(
    Proxy_L1_MessengerFast.address
  )

  // initialize with the address of the address_manager
  const ProxyL1MessengerTX = await Proxy_L1_MessengerFast_Deployed.initialize(
    addressManager.address
  )
  await ProxyL1MessengerTX.wait()
  console.log(`Proxy Fast L1 Messenger initialized: ${ProxyL1MessengerTX.hash}`)

}

deployFn.tags = ['Proxy_FastMessenger', 'required']
export default deployFn
