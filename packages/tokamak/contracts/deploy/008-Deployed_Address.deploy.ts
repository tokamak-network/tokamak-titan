/* Imports: External */
import path from 'path'
import fs from 'fs'

import { DeployFunction } from 'hardhat-deploy/dist/types'

const deployFn: DeployFunction = async (hre) => {
  const contracts = {}

  // get all deployed contracts
  const deployments = await hre.deployments.all()

  // key = contract name
  for (const key in deployments) {
    if (deployments.hasOwnProperty(key)) {
      contracts[key] = deployments[key].address
    }
  }

  const addresses = JSON.stringify(contracts, null, 2)

  // deployed contracts in L1 and L2
  console.log(addresses)

  // set path to save addreses.json
  const dumpsPath = path.resolve(__dirname, '../dist/dumps')

  if (!fs.existsSync(dumpsPath)) {
    fs.mkdirSync(dumpsPath, { recursive: true })
  }
  const addrsPath = path.resolve(dumpsPath, 'tokamak-addr.json')

  // write file
  fs.writeFileSync(addrsPath, addresses)
}

deployFn.tags = ['Log', 'required']

export default deployFn
