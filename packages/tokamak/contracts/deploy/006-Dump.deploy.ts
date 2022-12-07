/* Imports: External */
import path from 'path'
import fs from 'fs'

import { DeployFunction } from 'hardhat-deploy/dist/types'

const deployFn: DeployFunction = async (hre) => {
  const contracts = {}

  contracts['TOKENS'] = {}

  // get all deployed contracts
  const deployments = await hre.deployments.all()

  // key = contract name
  for (const key in deployments) {
    if (deployments.hasOwnProperty(key)) {
      const regex = /TK_L(1|2)([A-Z]+)/i
      const tokenMatch = key.match(regex)
      if (tokenMatch == null) {
        //not a token address
        contracts[key] = deployments[key].address
      } else if (tokenMatch && tokenMatch[1] === '1') {
        contracts['TOKENS'][tokenMatch[2]] = {
          L1: deployments[key].address,
          L2: deployments['TK_L2' + tokenMatch[2]].address,
        }
      }
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
