import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'
import { Contract, utils } from 'ethers'

// Message Contracts for test comms
import L2MessageJson from '../artifacts/contracts/Message/L2Message.sol/L2Message.json'
import { OptimismEnv } from './shared/env'
import { expect } from './shared/setup'

chai.use(chaiAsPromised)

const CONST_NUM_TXS = 11

describe('Fast Messenge Relayer Test', async () => {
  let L2Message: Contract

  let env: OptimismEnv

  before(async () => {
    // set new environment
    env = await OptimismEnv.new()

    const L2MessageAddress =
      await env.messengerFast.contracts.l1.AddressManager.getAddress(
        'L2Message'
      )
    L2Message = new Contract(L2MessageAddress, L2MessageJson.abi, env.l2Wallet)
  })

  // Test to send message from L2 to L1 using fast relayer
  // it('should QUICKLY send message from L2 to L1 using the fast relayer', async () => {
  //   const result = await env.waitForXDomainTransactionFast(
  //     L2Message.sendMessageL2ToL1({ gasLimit: 800000, gasPrice: 0 })
  //   )

  //   // decode result.remoteReceipt.logs[0].data
  //   const decodedData = utils.defaultAbiCoder.decode(
  //     ['string'], // set type
  //     result.remoteReceipt.logs[0].data
  //   )[0]

  //   // compare decodeData and "messageFromL2"
  //   expect(decodedData).to.equal('messageFromL2')
  // })


  // Test to send multiple message from L2 to L1 using fast relayer
  it('should send multiple messages from L2 to L1', async () => {
    // Define the number of times to send the message
    const sendPromises = []

    // Loop through and send the message multiple times
    for (let i = 0; i < CONST_NUM_TXS; i++) {
      // Push each send promise into an array
      sendPromises.push(
        env.waitForXDomainTransactionFast(
          L2Message.sendMessageL2ToL1({ gasLimit: 800000, gasPrice: 0 })
        ).then(result => {
          // decode result.remoteReceipt.logs[0].data
          const decodedData = utils.defaultAbiCoder.decode(
            ['string'], // set type
            result.remoteReceipt.logs[0].data
          )[0]

          // compare decodeData and "messageFromL2"
          expect(decodedData).to.equal('messageFromL2')
        })
      )

      // Delay for 1 second before sending the next message
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    // Wait for all send promises to resolve
    await Promise.all(sendPromises)

    console.log(`${sendPromises.length} messages were successfully relayed.`)
  })
})