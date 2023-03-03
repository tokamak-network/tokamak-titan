import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { Contract } from 'ethers'

// Message Contracts for test comms
import L2MessageJson from '../artifacts/contracts/Message/L2Message.sol/L2Message.json'
import { OptimismEnv } from './shared/env'

chai.use(chaiAsPromised)

describe('Fast Messenge Relayer Test', async () => {
  let L2Message: Contract

  let env: OptimismEnv

  before(async () => {
    // set new environment
    env = await OptimismEnv.new()

    // get contracts for TestComms
    L2Message = new Contract(
      env.addressesTOKAMAK.L2Message,
      L2MessageJson.abi,
      env.l2Wallet
    )
  })

  // Test to send message from L2 to L1 using fast relayer
  it('should QUICKLY send message from L2 to L1 using the fast relayer', async () => {
    await env.waitForXDomainTransactionFast(
      L2Message.sendMessageL2ToL1({ gasLimit: 800000, gasPrice: 0 })
    )
  })
})
