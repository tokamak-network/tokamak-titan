import chai, { expect } from 'chai'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiAsPromised)
import { ethers } from 'hardhat'
import { Contract, Signer, utils } from 'ethers'

let L2Ton: Contract
let L2BillingContract: Contract
let l2FeeWallet: string
const exitFee = utils.parseEther('1')

let signer: Signer
let signer2: Signer
let signerAddress: string
let signer2Address: string

const initialSupply = utils.parseEther('10000000000')
const tokenName = 'TON'
const tokenSymbol = 'TON'

describe('L2 Billing Contract', async () => {
  before(async () => {
    signer = (await ethers.getSigners())[0]
    signer2 = (await ethers.getSigners())[1]
    signerAddress = await signer.getAddress()
    signer2Address = await signer2.getAddress()

    // Set l2FeeWallet
    l2FeeWallet = signerAddress

    // deploy L2TON
    L2Ton = await (
      await ethers.getContractFactory('L1ERC20')
    ).deploy(initialSupply, tokenName, tokenSymbol, 18)

    // deploy L2BillingContract
    const billingContract = await ethers.getContractFactory('L2BillingContract')
    L2BillingContract = await billingContract.deploy()
    await L2BillingContract.deployed()
    // initial exit fee is 1 TON
    await L2BillingContract.initialize(L2Ton.address, l2FeeWallet, exitFee)
  })

  describe('Initialization', async () => {
    it('should revert when initialize with invalid params', async () => {
      const billingContract = await ethers.getContractFactory(
        'L2BillingContract'
      )
      const l2BillingContract = await billingContract.deploy()
      await l2BillingContract.deployed()
      // invalid params
      await expect(
        l2BillingContract.initialize(
          '0x0000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000',
          '0x0000000000000000000000000000000000000000'
        )
      ).to.be.revertedWith('Fee token address cannot be zero')
    })

    it('should have correct address', async () => {
      const feeTokenAddress = await L2BillingContract.feeTokenAddress()
      expect(feeTokenAddress).to.eq(L2Ton.address)
    })

    it('should have correct treasury address', async () => {
      const foundAddress = await L2BillingContract.l2FeeWallet()
      expect(foundAddress).to.eq(l2FeeWallet)
    })

    it('should have correct owner address set', async () => {
      const owner = await L2BillingContract.owner()
      expect(owner).to.eq(signerAddress)
    })

    it('should have correct exit fee', async () => {
      const fee = await L2BillingContract.exitFee()
      expect(fee).to.eq(exitFee)
    })

    it('should not initialize twice', async () => {
      await expect(
        L2BillingContract.initialize(L2Ton.address, l2FeeWallet, exitFee)
      ).to.be.revertedWith('Contract has been initialized')
    })
  })

  describe('Collect fee', async () => {
    it('should revert when having insufficient balance', async () => {
      await L2Ton.connect(signer2).approve(L2BillingContract.address, exitFee)
      await expect(
        L2BillingContract.connect(signer2).collectFee()
      ).to.be.revertedWith('ERC20: transfer amount exceeds balance')
    })

    it('should collect fee successfully', async () => {
      // signer -> signer2, exitFee
      await L2Ton.connect(signer).transfer(signer2Address, exitFee)
      const balanceBefore = await L2Ton.balanceOf(L2BillingContract.address)
      // approve signer2 (spender: L2BillingContract, amount: exitFee)
      await L2Ton.connect(signer2).approve(L2BillingContract.address, exitFee)
      // signer2 -> L2BillingContract, exitFee
      await L2BillingContract.connect(signer2).collectFee()
      const balanceAfter = await L2Ton.balanceOf(L2BillingContract.address)

      expect(balanceAfter.sub(balanceBefore)).to.eq(exitFee)
    })

    it('should not withdaw fee if balance is too low', async () => {
      // actual balance is 1 TON < 150 TON
      await expect(L2BillingContract.withdraw()).to.be.revertedWith(
        'Balance is too low'
      )
    })

    it('should withdraw fee successfully', async () => {
      // signer -> L2BillingContract, 150 TON
      await L2Ton.connect(signer).transfer(
        L2BillingContract.address,
        ethers.utils.parseEther('150')
      )

      const L2BillingContractBalanace = await L2Ton.balanceOf(
        L2BillingContract.address
      )

      const balanceBefore = await L2Ton.balanceOf(signerAddress)
      // L2BillingContract -> signer, L2BillingContractBalance
      await L2BillingContract.connect(signer).withdraw()
      const balanceAfter = await L2Ton.balanceOf(signerAddress)
      expect(balanceBefore).to.eq(balanceAfter.sub(L2BillingContractBalanace))
    })
  })
})
