# Drive Smart Contracts

This directory contains the smart contracts for the Drive platform's Web3 payment and escrow functionality.

## Contracts

### VehicleEscrow.sol
The main escrow contract for vehicle transactions. Supports:
- Stablecoin payments (USDC, USDT, DAI)
- Conditional fund release based on:
  - Inspection verification
  - Document verification
  - Buyer confirmation
  - Seller confirmation
- Dispute handling
- Platform fee collection (default 2.5%)

## Setup

Install dependencies:
```bash
npm install
```

## Development

Compile contracts:
```bash
npm run compile
```

Run tests:
```bash
npm test
```

Start local Hardhat node:
```bash
npm run node
```

## Deployment

Deploy to local network:
```bash
npm run deploy:local
```

Deploy to Sepolia testnet:
```bash
npm run deploy:sepolia
```

Make sure to configure your `.env` file with the required variables (see `.env.example`).

## Security Considerations

- The contract uses OpenZeppelin's battle-tested implementations
- ReentrancyGuard protects against reentrancy attacks
- Only the platform (owner) can mark inspections/documents as verified
- Both buyer and seller must confirm before funds are released
- Disputes can be raised by either party

## Integration

After deployment, update the contract address in:
- `apps/api/.env` as `ESCROW_CONTRACT_ADDRESS`
- `apps/web/.env` as `NEXT_PUBLIC_ESCROW_CONTRACT_ADDRESS`
