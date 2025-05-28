[![Ask DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/obaldwin4/congenial-palm-tree)
# Congenial Palm - Portfolio Tracker

A comprehensive portfolio tracking, analytics, accounting, and tax reporting tool that respects your privacy. This application is split into two main components:

1. **Backend**: A Python-based service that handles data processing, storage, and API endpoints
2. **Frontend**: A Next.js web application that provides a modern user interface

## System Requirements

- Python 3.9 or 3.10 (recommended for backend compatibility)
- Node.js 18+ and npm
- SQLCipher installed on your system

## Backend Setup

The backend is built using Flask and provides a comprehensive REST API for portfolio tracking and analysis.

### Installing Dependencies

1. Install SQLCipher (required for secure database encryption):

   ```bash
   # macOS
   brew install sqlcipher
   
   # Ubuntu/Debian
   sudo apt-get install libsqlcipher-dev
   
   # Windows
   # Download from https://www.zetetic.net/sqlcipher/open-source/
   ```

2. Create a Python virtual environment and install dependencies:

   ```bash
   cd Backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Upgrade pip
   pip install --upgrade pip
   
   # Install the required dependencies
   SQLCIPHER_PATH=/opt/homebrew/opt/sqlcipher pip install -r requirements.txt
   ```

### Running the Backend

Once all dependencies are installed, you can run the backend server:

```bash
cd Backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -m rotkehlchen
```

The API will be available at `http://localhost:5042/api/1/`.

## Frontend Setup

The frontend is built using Next.js 14 with TypeScript, Tailwind CSS, and integrates with the backend API.

### Installing Dependencies

```bash
cd Frontend
npm install
```

### Running the Frontend

Once all dependencies are installed, you can run the development server:

```bash
cd Frontend
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Features

- **User Authentication and Management**: Create and manage user accounts with secure password-based encryption
- **Blockchain Integration**: Track balances and transactions across multiple blockchains (Ethereum, Bitcoin, and more)
- **Exchange API Integration**: Connect to cryptocurrency exchanges to fetch balances and trading history
- **DeFi Protocol Integration**: Track positions in DeFi protocols like Aave, Compound, Uniswap, etc.
- **Asset Price Tracking**: Track real-time and historical prices of cryptocurrencies and other assets
- **Risk Analysis**: View Value at Risk (VaR) and other risk metrics for your portfolio
- **Accounting and Tax Reporting**: Generate tax reports and track capital gains/losses

## Development

### Testing

To run frontend tests:

```bash
cd Frontend
npm test
```

To run backend tests:

```bash
cd Backend
source venv/bin/activate
pytest
```

## Troubleshooting

### Backend Issues

- **SQLCipher Installation**: If you encounter issues with pysqlcipher3 installation, make sure that SQLCipher is properly installed on your system and the correct path is provided.
- **Python Version**: This backend is optimized for Python 3.9 or 3.10. If you're using a different version, you might encounter compatibility issues.

### Frontend Issues

- **Node Version**: Make sure you're using Node.js 18 or later.
- **API Connection**: Ensure the backend API is running and the `.env.local` file has the correct API URL.

## Security

All data is stored encrypted locally on your device. API keys and other sensitive information are securely encrypted using industry-standard encryption.

## License

This project is licensed under the BSD-3 License. See the LICENSE file for details.
