# Complete Backend Setup Guide

This guide will help you configure your portfolio tracking backend with real blockchain nodes and exchange APIs, ensuring everything works perfectly with your frontend.

## 1. Blockchain Node Configuration

For real blockchain data, you need access to Ethereum and other blockchain nodes. Here are recommended services:

### Ethereum Nodes (Choose One)

- **Alchemy** (Recommended)
  - Sign up at [https://www.alchemy.com/](https://www.alchemy.com/)
  - Create an app for Ethereum Mainnet
  - Copy your API key and replace `YOUR_API_KEY` in `node_config.json`
  - Final URL should look like: `https://eth-mainnet.g.alchemy.com/v2/abc123xyz456`

- **Infura**
  - Sign up at [https://infura.io/](https://infura.io/)
  - Create a new project
  - Copy your Project ID and replace `YOUR_API_KEY` in `node_config.json`
  - Final URL should look like: `https://mainnet.infura.io/v3/abc123xyz456`

### Bitcoin and Other Blockchains

For Bitcoin data without running your own node, consider:

- **Blockdaemon**
  - Sign up at [https://blockdaemon.com/](https://blockdaemon.com/)
  - Get an API key and use their Bitcoin API
  - Update `btc_rpc_endpoint` accordingly

- **BlockCypher**
  - Free API at [https://www.blockcypher.com/](https://www.blockcypher.com/)
  - Endpoint: `https://api.blockcypher.com/v1/btc/main`

## 2. Exchange API Configuration

For real exchange data, set up API keys with the following exchanges:

### Binance

1. Create an account at [Binance](https://www.binance.com/)
2. Go to API Management
3. Create a new API key (Read-only permissions are sufficient)
4. Add your key and secret to `exchange_config.json`

### Coinbase

1. Create an account at [Coinbase](https://www.coinbase.com/)
2. Go to Settings > API
3. Create a new API key with "view" permissions only
4. Add your key and secret to `exchange_config.json`

### Kraken

1. Create an account at [Kraken](https://www.kraken.com/)
2. Go to Security > API
3. Create a new API key with "Query Funds" permission
4. Add your key and secret to `exchange_config.json`

## 3. Wallet Integration

### Browser Wallets (MetaMask, etc.)

The frontend already supports RainbowKit for wallet connection. Once connected:

1. The wallet address will be sent to backend via the `/blockchains` API
2. The backend will track these addresses and fetch balances

### Hardware Wallets

For Ledger or Trezor integration:

1. Connect your hardware wallet
2. Use the frontend to add the wallet address
3. The backend will track the address (read-only)

## 4. Starting the Backend

Run the backend with:

```bash
cd /Users/chakradharishiva/Desktop/Major_Project
source fullbackend/bin/activate
python start_backend.py
```

For debugging issues:

```bash
python start_backend.py --debug
```

## 5. Connecting the Frontend

Update your frontend environment variables in `/Frontend/.env.local`:

```
NEXT_PUBLIC_API=http://localhost:5042/api/1
NEXT_PUBLIC_WS=ws://localhost:5042
NEXT_PUBLIC_APP_NAME=congenialpalm
```

Then start your frontend:

```bash
cd /Users/chakradharishiva/Desktop/Major_Project/Frontend
npm run dev
```

## Troubleshooting

If you encounter any issues:

1. Check the backend logs for errors
2. Verify API keys are correctly entered
3. Ensure your blockchain node endpoints are working
4. Confirm the correct environment variables in the frontend

For more detailed help, consult the Rotkehlchen documentation.
