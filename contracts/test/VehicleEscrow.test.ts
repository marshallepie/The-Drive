import { expect } from 'chai'
import { ethers } from 'hardhat'
import { VehicleEscrow } from '../typechain-types'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'

describe('VehicleEscrow', function () {
  let escrow: VehicleEscrow
  let owner: SignerWithAddress
  let buyer: SignerWithAddress
  let seller: SignerWithAddress
  let feeReceiver: SignerWithAddress

  beforeEach(async function () {
    [owner, buyer, seller, feeReceiver] = await ethers.getSigners()

    const VehicleEscrow = await ethers.getContractFactory('VehicleEscrow')
    escrow = await VehicleEscrow.deploy(feeReceiver.address)
    await escrow.waitForDeployment()
  })

  describe('Deployment', function () {
    it('Should set the correct owner', async function () {
      expect(await escrow.owner()).to.equal(owner.address)
    })

    it('Should set the correct platform fee receiver', async function () {
      expect(await escrow.platformFeeReceiver()).to.equal(feeReceiver.address)
    })

    it('Should have default platform fee of 2.5%', async function () {
      expect(await escrow.platformFeePercent()).to.equal(250)
    })
  })

  describe('Token Management', function () {
    it('Should allow owner to add supported token', async function () {
      const tokenAddress = '0x1234567890123456789012345678901234567890'
      await escrow.addSupportedToken(tokenAddress)
      expect(await escrow.supportedTokens(tokenAddress)).to.be.true
    })

    it('Should not allow non-owner to add supported token', async function () {
      const tokenAddress = '0x1234567890123456789012345678901234567890'
      await expect(
        escrow.connect(buyer).addSupportedToken(tokenAddress)
      ).to.be.reverted
    })
  })

  // Additional tests would be added here for:
  // - Creating escrows
  // - Funding escrows
  // - Meeting conditions
  // - Releasing funds
  // - Refunding
  // - Disputes
})
