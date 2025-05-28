# Dockerized Portfolio Tracking Backend API

This document explains how to build, run, and use the containerized version of the portfolio tracking backend API service.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually comes with Docker Desktop)

## Quick Start

1. Navigate to the project root directory:
   ```bash
   cd /Users/chakradharishiva/Desktop/Major_Project
   ```

2. Build and start the containerized backend service:
   ```bash
   docker-compose up -d
   ```

3. Check if the service is running:
   ```bash
   docker-compose ps
   ```

4. Test the API:
   ```bash
   curl http://localhost:8081/api/version
   ```

## API Endpoints

Your backend service exposes the following key API endpoints:

- **Version Info**: `GET http://localhost:8081/api/version`
- **Health Check**: `GET http://localhost:8081/api/health`
- **Ping Test**: `GET http://localhost:8081/api/1/ping`
- **Portfolio Data**: `GET http://localhost:8081/api/portfolio`
- **Balances**: `GET http://localhost:8081/api/1/balances/all`
- **Transactions**: `GET http://localhost:8081/api/1/transactions`
- **PnL Report**: `GET http://localhost:8081/api/1/pnl_report`
- **Statistics**: `GET http://localhost:8081/api/1/statistics/netvalue`
- **Value Distribution**: `GET http://localhost:8081/api/1/statistics/value_distribution`

## Data Persistence

The service is configured to persist data using Docker volumes:
- Your data is stored in `./Backend/data` and mounted to `/app/data` in the container

## Managing the Container

- **Start the service**:
  ```bash
  docker-compose up -d
  ```

- **Stop the service**:
  ```bash
  docker-compose down
  ```

- **View logs**:
  ```bash
  docker-compose logs -f
  ```

- **Rebuild the container** (after making changes to the code):
  ```bash
  docker-compose build
  docker-compose up -d
  ```

## Exchange Connectivity

To connect real exchange accounts:
1. Use the `/api/1/exchanges` endpoint with appropriate API credentials
2. The backend will validate your exchange API keys and start fetching real data

## Wallet Integration

To track real blockchain wallets:
1. Use the `/api/1/blockchains` endpoint to register wallet addresses
2. The system will automatically fetch and track balances and transactions

## Security Considerations

- The API server is exposed on port 8081, which should be secured in production
- Consider using HTTPS for production deployments
- API keys and wallet addresses are stored in the data volume, ensure proper permissions

## Troubleshooting

If you encounter issues:

1. Check container logs:
   ```bash
   docker-compose logs backend
   ```

2. Verify the container is running:
   ```bash
   docker-compose ps
   ```

3. Ensure port 8081 is available on your host machine
