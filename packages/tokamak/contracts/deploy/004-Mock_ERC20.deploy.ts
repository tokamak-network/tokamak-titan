/* Imports: External */
import { DeployFunction, DeploymentSubmission } from 'hardhat-deploy/dist/types'
import { Contract, ContractFactory, utils } from 'ethers'
import { getContractFactory } from '@eth-optimism/contracts'
import { getChainId } from '@eth-optimism/core-utils'

/* eslint-disable */
require('dotenv').config()

import { registerAddress } from './000-L1MessengerFast.deploy'
import L1ERC20Json from '../artifacts/contracts/test-helpers/L1ERC20.sol/L1ERC20.json'

let Factory__L1ERC20: ContractFactory
let Factory__L2ERC20: ContractFactory

let L1TON: Contract
let L2TON: Contract

const initialSupply_18 = utils.parseEther('10000000000')

const deployFn: DeployFunction = async (hre) => {
  // check whether we use Hardhat node
  const isHardhatNode = async (hre) => {
    return (await getChainId(hre.ethers.provider)) === 31337
  }

  if (await isHardhatNode(hre)) {
    // get address manager
    const addressManager = getContractFactory('Lib_AddressManager')
      .connect((hre as any).deployConfig.deployer_l1)
      .attach(process.env.ADDRESS_MANAGER_ADDRESS) as any

    // get ContractFactory of L1/L2ERC20
    Factory__L1ERC20 = new ContractFactory(
      L1ERC20Json.abi,
      L1ERC20Json.bytecode,
      (hre as any).deployConfig.deployer_l1
    )

    Factory__L2ERC20 = getContractFactory(
      'L2StandardERC20',
      (hre as any).deployConfig.deployer_l2
    )

    // deploy L1TON
    L1TON = await Factory__L1ERC20.deploy(
      initialSupply_18,
      'Tokamak Network',
      'TON',
      18
    )
    await L1TON.deployTransaction.wait()

    const L1TONDeploymentSubmission: DeploymentSubmission = {
      ...L1TON,
      receipt: L1TON.receipt,
      address: L1TON.address,
      abi: L1ERC20Json.abi,
    }

    // save deployment
    await hre.deployments.save('L1TON', L1TONDeploymentSubmission)

    // register L1TON in address manager
    await registerAddress(addressManager, 'L1TON', L1TON.address)
    console.log(`L1TON was newly deployed to ${L1TON.address}`)

    // deploy L2TON
    L2TON = await Factory__L2ERC20.deploy(
      (hre as any).deployConfig.L2StandardBridgeAddress,
      L1TON.address,
      'Tokamak Network',
      'TON'
    )
    await L2TON.deployTransaction.wait()


    // save L2TON deployment using hre
    const L2TONDeploymentSubmission: DeploymentSubmission = {
      ...L2TON,
      receipt: L2TON.receipt,
      address: L2TON.address,
      abi: L2TON.abi,
    }
    await hre.deployments.save('L2TON', L2TONDeploymentSubmission)

    // register L2TON in address manager
    await registerAddress(addressManager, 'L2TON', L2TON.address)
    console.log(`L2TON was deployed to ${L2TON.address}`)

  }
}

deployFn.tags = ['L1TON', 'L2TON', 'test']
export default deployFn
