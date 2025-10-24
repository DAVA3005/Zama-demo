# FHE Swap DApp (sample)

This repository contains a minimal token-swap dApp (SimpleAMM) with optional FHE estimation integration.

Quick start:

1. Install deps:
   ```bash
   npm install
   cd frontend
   npm install
   ```

2. Run Hardhat node:
   ```bash
   npx hardhat node
   ```

3. Deploy contracts:
   ```bash
   npx hardhat run scripts/deploy-swap.js --network localhost
   ```

4. Update frontend with deployed contract address and run:
   ```bash
   cd frontend
   npm run dev
   ```

Do NOT commit private keys. Use `.env` for RPC and private key when deploying to testnet.
