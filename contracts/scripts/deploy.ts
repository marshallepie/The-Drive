import { ethers } from 'hardhat'

async function main() {
  console.log('Deploying VehicleEscrow contract...')

  const [deployer] = await ethers.getSigners()
  console.log('Deploying with account:', deployer.address)

  const balance = await ethers.provider.getBalance(deployer.address)
  console.log('Account balance:', ethers.formatEther(balance), 'ETH')

  // Deploy VehicleEscrow
  const VehicleEscrow = await ethers.getContractFactory('VehicleEscrow')
  const platformFeeReceiver = deployer.address // Use deployer as fee receiver for now
  const escrow = await VehicleEscrow.deploy(platformFeeReceiver)

  await escrow.waitForDeployment()
  const escrowAddress = await escrow.getAddress()

  console.log('VehicleEscrow deployed to:', escrowAddress)
  console.log('Platform fee receiver:', platformFeeReceiver)

  // If on testnet, add some supported tokens (example addresses for Sepolia)
  if ((await ethers.provider.getNetwork()).chainId === 11155111n) {
    console.log('Adding supported tokens for Sepolia testnet...')
    // These are example addresses - replace with actual stablecoin addresses
    const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'
    await escrow.addSupportedToken(USDC_SEPOLIA)
    console.log('Added USDC support')
  }

  console.log('\nDeployment complete!')
  console.log('Save this contract address in your .env files')
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
