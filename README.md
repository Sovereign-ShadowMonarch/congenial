# Crypto Portfolio Management & Analysis Platform

## Overview

This project is an end-to-end solution for cryptocurrency portfolio management, technical analysis, market prediction, and paper trading. It combines multiple technologies to provide users with tools for tracking their crypto assets, analyzing market trends, making informed investment decisions, and practicing trading strategies without real financial risk.

## Project Components

### Backend

The core API server built with Flask that handles:

- User authentication and account management
- Portfolio tracking across multiple blockchains and exchanges
- Transaction history and financial reporting
- Real-time data updates via WebSockets
- Performance metrics and P&L calculations

**Key Features:**
- Multi-blockchain wallet integration
- Exchange API connectivity
- Transaction history tracking
- Portfolio performance analytics
- Real-time updates via WebSockets

**Tech Stack:**
- Python with Flask
- Flask-SocketIO for real-time communication
- RESTful API design
- JSON-based data storage

### Frontend

A modern web interface built with Next.js and React that provides:

- Intuitive portfolio dashboard
- Asset allocation visualization
- Transaction history
- Exchange and wallet management
- Performance charts and statistics

**Tech Stack:**
- Next.js framework
- TypeScript
- Tailwind CSS for styling

### ML Models

Machine learning models for financial risk assessment:

- Value at Risk (VaR) calculations
- Risk metrics for portfolio management

**Tech Stack:**
- Python with Jupyter notebooks
- Data analysis libraries (pandas, numpy)

### Prediction-chat (FinAgent)

AI-powered financial analysis and prediction tool that provides:

- Technical analysis of cryptocurrencies (moving averages, RSI, etc.)
- Buy/sell signals based on technical indicators
- Web search for latest market insights and expert opinions
- Comprehensive market analysis for crypto assets

**Key Features:**
- Multi-agent architecture combining financial tools with web search
- Technical indicator calculations
- Expert recommendations retrieval
- Customized analysis for cryptocurrencies

**Tech Stack:**
- Python
- OpenAI GPT models via phi library
- yfinance for financial data
- DuckDuckGo search integration

### Paper Trading

Simulated trading platform for practicing investment strategies without financial risk:

- Virtual portfolio management
- Mock trading with real-time market data
- Performance tracking and analysis

## Getting Started

### Prerequisites

- Docker and Docker Compose (for container deployment)
- Node.js and npm/yarn (for frontend development)
- Python 3.9+ (for backend and AI components)

### Setup Instructions

1. **Clone the repository**

2. **Start the Backend and Services with Docker**

   ```bash
   docker-compose up -d
   ```

3. **Setup the Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Setup the Prediction Agent**

   ```bash
   cd Prediction-chat/FinAgent
   pip install -r requirements.txt
   # Set up your OpenAI API key in a .env file
   python main.py
   ```

5. **Access Paper Trading**

   Follow instructions in `Paper_Trading/PaperTrader/RUNNING_INSTRUCTIONS.md`

## Architecture

The platform follows a microservices architecture with the following components:

- Backend API server provides core financial data and portfolio management
- Frontend delivers the user interface and visualization
- ML Models perform risk calculations and predictions
- FinAgent provides AI-driven market analysis and recommendations
- Paper Trading enables practice without financial risk

## API Documentation

The Backend provides a comprehensive API for all portfolio management functions:

- `/api/version` - Get API version information
- `/api/portfolio` - Get portfolio data
- `/api/users` - User management endpoints
- `/api/blockchains` - Blockchain wallet management
- `/api/exchanges` - Exchange API management
- `/api/balances` - Portfolio balance endpoints
- `/api/pnl` - Profit and loss reporting
- `/api/transactions` - Transaction history
- `/api/statistics` - Performance metrics

Detailed API documentation available in the Backend README.

## Contributing

Contribution guidelines are available in `Backend/CONTRIBUTING.md`

## License

This project is proprietary software. All rights reserved.
