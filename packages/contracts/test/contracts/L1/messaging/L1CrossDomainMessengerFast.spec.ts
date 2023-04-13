import { ethers } from 'hardhat'
import { Contract, BigNumber } from 'ethers'
import { smock, FakeContract, MockContract } from '@defi-wonderland/smock'
import { toHexString } from '@eth-optimism/core-utils'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'

import { expect } from '../../../setup'
import {
  DUMMY_BATCH_HEADERS,
  DUMMY_BATCH_PROOFS,
  TrieTestGenerator,
  getNextBlockNumber,
  encodeXDomainCalldata,
  deploy,
} from '../../../helpers'
const MAX_GAS_LIMIT = 8_000_000
const ENQUEUE_GAS_COST = 60_000
const L2_GAS_DISCOUNT_DIVISOR = 32
const NON_ZERO_ADDRESS = '0x1111111111111111111111111111111111111111'

describe('L1CrossDomainMessengerFast', () => {
  let signer1: SignerWithAddress
  let signer2: SignerWithAddress
  before(async () => {
    // get signer
    ;[signer1, signer2] = await ethers.getSigners()
  })

  // mock contracts
  let Fake__TargetContract: FakeContract
  let Fake__L2CrossDomainMessenger: FakeContract
  let Fake__StateCommitmentChain: FakeContract
  before(async () => {
    // initialize fake contracts

    Fake__TargetContract = await smock.fake('TestERC20')
    Fake__L2CrossDomainMessenger = await smock.fake('L2CrossDomainMessenger', {
      // defined by packages/contracts/src/predeploys.ts
      // L2CrossDomainMessenger
      address: '0x4200000000000000000000000000000000000007',
    })
    Fake__StateCommitmentChain = await smock.fake('StateCommitmentChain')
  })

  let AddressManager: Contract
  let CanonicalTransactionChain: Contract
  before(async () => {
    // deploy AddressManager
    AddressManager = await deploy('Lib_AddressManager')

    // add L2CrossDomainMessenger in AddressManager
    await AddressManager.setAddress(
      'L2CrossDomainMessenger',
      Fake__L2CrossDomainMessenger.address
    )

    // add StateCommitmentChain in AddressManager
    await AddressManager.setAddress(
      'StateCommitmentChain',
      Fake__StateCommitmentChain.address
    )

    // deploy CanonicalTransactionChain
    CanonicalTransactionChain = await deploy('CanonicalTransactionChain', {
      args: [
        AddressManager.address,
        MAX_GAS_LIMIT,
        L2_GAS_DISCOUNT_DIVISOR,
        ENQUEUE_GAS_COST,
      ],
    })

    // deploy ChainStorageContainer
    const batches = await deploy('ChainStorageContainer', {
      args: [AddressManager.address, 'CanonicalTransactionChain'],
    })

    // add ChainStorageContainer-CTC-batches
    await AddressManager.setAddress(
      'ChainStorageContainer-CTC-batches',
      batches.address
    )

    // add CanonicalTransactionChain
    await AddressManager.setAddress(
      'CanonicalTransactionChain',
      CanonicalTransactionChain.address
    )
  })

  let L1CrossDomainMessengerFast: Contract
  beforeEach(async () => {
    // deploy L1CrossDomainMessengerFast
    const xDomainMessengerImpl = await deploy('L1CrossDomainMessengerFast')

    // add L1CrossDomainMessengerFast
    await AddressManager.setAddress(
      'L1CrossDomainMessengerFast',
      xDomainMessengerImpl.address
    )

    // set proxy
    const proxy = await deploy('Lib_ResolvedDelegateProxy', {
      args: [AddressManager.address, 'L1CrossDomainMessengerFast'],
    })

    L1CrossDomainMessengerFast = xDomainMessengerImpl.attach(proxy.address)

    // initiate L1CrossDomainMessengerFast
    await L1CrossDomainMessengerFast.initialize(AddressManager.address)
  })

  describe('pause', () => {
    describe('when called by the current owner', () => {
      it('should pause the contract', async () => {
        console.log(L1CrossDomainMessengerFast)
        await L1CrossDomainMessengerFast.pause()

        expect(await L1CrossDomainMessengerFast.paused()).to.be.true
      })
    })

    describe('when called by account other than the owner', () => {
      it('should not pause the contract', async () => {
        await expect(
          L1CrossDomainMessengerFast.connect(signer2).pause()
        ).to.be.revertedWith('Ownable: caller is not the owner')
      })
    })
  })

  describe('xDomainMessageSender', () => {
    let Mock__L1CrossDomainMessengerFast: MockContract<Contract>
    before(async () => {
      // deploy Mock__L1CrossDomainMessengerFast
      Mock__L1CrossDomainMessengerFast = await (
        await smock.mock('L1CrossDomainMessenger')
      ).deploy()
    })

    // check sender of cross domain message
    it('should return the xDomainMsgSender address', async () => {
      // set sender address
      await Mock__L1CrossDomainMessengerFast.setVariable(
        'xDomainMsgSender',
        NON_ZERO_ADDRESS
      )

      expect(
        await Mock__L1CrossDomainMessengerFast.xDomainMessageSender()
      ).to.equal(NON_ZERO_ADDRESS)
    })
  })

  const generateMockRelayMessageProof = async (
    target: string,
    sender: string,
    message: string,
    messageNonce: number = 0
  ): Promise<{
    calldata: string
    proof: any
  }> => {
    const calldata = encodeXDomainCalldata(
      target,
      sender,
      message,
      messageNonce
    )

    const storageKey = ethers.utils.keccak256(
      ethers.utils.hexConcat([
        ethers.utils.keccak256(
          ethers.utils.hexConcat([
            calldata,
            Fake__L2CrossDomainMessenger.address,
          ])
        ),
        ethers.constants.HashZero,
      ])
    )

    const storageGenerator = await TrieTestGenerator.fromNodes({
      nodes: [
        {
          key: storageKey,
          val: '0x' + '01'.padStart(2, '0'),
        },
      ],
      secure: true,
    })

    const generator = await TrieTestGenerator.fromAccounts({
      accounts: [
        {
          // defined in packages/contracts/src/predeploys.ts
          // OVM_L2ToL1MessagePasser
          address: '0x4200000000000000000000000000000000000000',
          nonce: 0,
          balance: 0,
          codeHash: ethers.utils.keccak256('0x1234'),
          storageRoot: toHexString(storageGenerator._trie.root),
        },
      ],
      secure: true,
    })

    const proof = {
      stateRoot: toHexString(generator._trie.root),
      stateRootBatchHeader: DUMMY_BATCH_HEADERS[0],
      stateRootProof: DUMMY_BATCH_PROOFS[0],
      stateTrieWitness: (
        await generator.makeAccountProofTest(
          '0x4200000000000000000000000000000000000000'
        )
      ).accountTrieWitness,
      storageTrieWitness: (
        await storageGenerator.makeInclusionProofTest(storageKey)
      ).proof,
    }

    return {
      calldata,
      proof,
    }
  }

  describe('relayMessage', () => {
    let target: string
    let message: string
    let proof: any
    let calldata: string
    before(async () => {
      target = Fake__TargetContract.address
      message = Fake__TargetContract.interface.encodeFunctionData('mint', [
        NON_ZERO_ADDRESS,
        ethers.utils.parseEther('1'),
      ])
      // generate storage proof for mock contract
      ;({ proof, calldata } = await generateMockRelayMessageProof(
        target,
        signer1.address,
        message
      ))
    })

    beforeEach(() => {
      Fake__StateCommitmentChain.verifyStateCommitment.returns(true)
    })

    it('should revert if attempting to relay a message sent to an L1 system contract', async () => {
      const maliciousProof = await generateMockRelayMessageProof(
        CanonicalTransactionChain.address,
        signer1.address,
        message
      )

      await expect(
        L1CrossDomainMessengerFast.relayMessage(
          CanonicalTransactionChain.address,
          signer1.address,
          message,
          0,
          maliciousProof.proof
        )
      ).to.be.revertedWith(
        'Cannot send L2->L1 messages to L1 system contracts.'
      )
    })

    it('should revert if provided an invalid state root proof', async () => {
      Fake__StateCommitmentChain.verifyStateCommitment.returns(false)

      const proof1 = {
        stateRoot: ethers.constants.HashZero,
        stateRootBatchHeader: DUMMY_BATCH_HEADERS[0],
        stateRootProof: DUMMY_BATCH_PROOFS[0],
        stateTrieWitness: '0x',
        storageTrieWitness: '0x',
      }

      await expect(
        L1CrossDomainMessengerFast.relayMessage(
          target,
          signer1.address,
          message,
          0,
          proof1
        )
      ).to.be.revertedWith('Provided message could not be verified.')
    })

    it('should revert if provided an invalid storage trie witness', async () => {
      await expect(
        L1CrossDomainMessengerFast.relayMessage(
          target,
          signer1.address,
          message,
          0,
          {
            ...proof,
            storageTrieWitness: '0x',
          }
        )
      ).to.be.reverted
    })

    it('should revert if provided an invalid state trie witness', async () => {
      await expect(
        L1CrossDomainMessengerFast.relayMessage(
          target,
          signer1.address,
          message,
          0,
          {
            ...proof,
            stateTrieWitness: '0x',
          }
        )
      ).to.be.reverted
    })

    it('should send a successful call to the target contract', async () => {
      // return latest block height + 1
      const blockNumber = await getNextBlockNumber(ethers.provider)

      await L1CrossDomainMessengerFast.relayMessage(
        target,
        signer1.address,
        message,
        0,
        proof
      )

      expect(
        await L1CrossDomainMessengerFast.successfulMessages(
          ethers.utils.keccak256(calldata)
        )
      ).to.equal(true)

      expect(
        await L1CrossDomainMessengerFast.relayedMessages(
          ethers.utils.keccak256(
            ethers.utils.hexConcat([
              calldata,
              signer1.address,
              ethers.utils.hexZeroPad(
                BigNumber.from(blockNumber).toHexString(),
                32
              ),
            ])
          )
        )
      ).to.equal(true)
    })

    it('the xDomainMessageSender is reset to the original value', async () => {
      await expect(
        L1CrossDomainMessengerFast.xDomainMessageSender()
      ).to.be.revertedWith('xDomainMessageSender is not set')

      await L1CrossDomainMessengerFast.relayMessage(
        target,
        signer1.address,
        message,
        0,
        proof
      )

      await expect(
        L1CrossDomainMessengerFast.xDomainMessageSender()
      ).to.be.revertedWith('xDomainMessageSender is not set')
    })

    it('should revert if trying to send the same message twice', async () => {
      await L1CrossDomainMessengerFast.relayMessage(
        target,
        signer1.address,
        message,
        0,
        proof
      )

      await expect(
        L1CrossDomainMessengerFast.relayMessage(
          target,
          signer1.address,
          message,
          0,
          proof
        )
      ).to.be.revertedWith('Provided message has already been received.')
    })

    it('should revert if paused', async () => {
      await L1CrossDomainMessengerFast.pause()

      await expect(
        L1CrossDomainMessengerFast.relayMessage(
          target,
          signer1.address,
          message,
          0,
          proof
        )
      ).to.be.revertedWith('Pausable: paused')
    })

    describe('blockMessage and allowMessage', () => {
      it('should revert if called by an account other than the owner', async () => {
        const L1CrossDomainMessengerFast2 =
          L1CrossDomainMessengerFast.connect(signer2)

        await expect(
          L1CrossDomainMessengerFast2.blockMessage(
            ethers.utils.keccak256(calldata)
          )
        ).to.be.revertedWith('Ownable: caller is not the owner')

        await expect(
          L1CrossDomainMessengerFast2.allowMessage(
            ethers.utils.keccak256(calldata)
          )
        ).to.be.revertedWith('Ownable: caller is not the owner')
      })

      it('should revert if the message is blocked', async () => {
        await L1CrossDomainMessengerFast.blockMessage(
          ethers.utils.keccak256(calldata)
        )

        await expect(
          L1CrossDomainMessengerFast.relayMessage(
            target,
            signer1.address,
            message,
            0,
            proof
          )
        ).to.be.revertedWith('Provided message has been blocked.')
      })

      it('should succeed if the message is blocked, then unblocked', async () => {
        await L1CrossDomainMessengerFast.blockMessage(
          ethers.utils.keccak256(calldata)
        )

        await expect(
          L1CrossDomainMessengerFast.relayMessage(
            target,
            signer1.address,
            message,
            0,
            proof
          )
        ).to.be.revertedWith('Provided message has been blocked.')

        await L1CrossDomainMessengerFast.allowMessage(
          ethers.utils.keccak256(calldata)
        )

        await expect(
          L1CrossDomainMessengerFast.relayMessage(
            target,
            signer1.address,
            message,
            0,
            proof
          )
        ).to.not.be.reverted
      })
    })
  })
})
