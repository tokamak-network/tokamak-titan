/* Imports: External */
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory, ethers } from 'ethers'
import { getContractFactory } from '@eth-optimism/contracts'

import { registerAddress } from './000-L1MessengerFast.deploy'
import L2BillingContractJson from '../artifacts/contracts/L2BillingContract.sol/L2BillingContract.json'

let Factory__L2BillingContract: ContractFactory

let L2BillingContract: Contract

const deployFn: DeployFunction = async (hre) => {
  //get address manager
  const addressManager = getContractFactory('Lib_AddressManager')
    .connect((hre as any).deployConfig.deployer_l1)
    .attach(process.env.ADDRESS_MANAGER_ADDRESS) as any

  // get factory of L2BillingContract
  Factory__L2BillingContract = new ContractFactory(
    L2BillingContractJson.abi,
    L2BillingContractJson.bytecode,
    (hre as any).deployConfig.deployer_l2
  )

  console.log(`'Deploying L2 billing contract...`)

  // deploy L2BillingContract
  L2BillingContract = await Factory__L2BillingContract.deploy()
  await L2BillingContract.deployTransaction.wait()

  const L2BillingContractDeploymentSubmission: DeploymentSubmission = {
    ...L2BillingContract,
    receipt: L2BillingContract.receipt,
    address: L2BillingContract.address,
    abi: L2BillingContract.abi,
  }
  await hre.deployments.save(
    'TokamakBillingContract',
    L2BillingContractDeploymentSubmission
  )
  console.log(
    `TokamakBillingContract deployed to: ${L2BillingContract.address}`
  )

  // Initialize the billing contract
  const L2TON = await hre.deployments.getOrNull('L2TON')

  // initial exit fee = 10 TON
  await L2BillingContract.initialize(
    L2TON.address,
    (hre as any).deployConfig.deployer_l2.address,
    ethers.utils.parseEther('10')
  )

  await registerAddress(
    addressManager,
    'TokamakBillingContract',
    L2BillingContract.address
  )
}

deployFn.tags = ['TokamakBillingContract', 'required']

export default deployFn
