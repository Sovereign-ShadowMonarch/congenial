# Running the Backend Service

This document provides comprehensive instructions for setting up, running, and maintaining the Backend service in different environments.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Running Methods](#running-methods)
  - [Using Python Directly](#using-python-directly)
  - [Using the Entry Point Script](#using-the-entry-point-script)
  - [Using the Convenience Script](#using-the-convenience-script)
  - [Using Docker (Recommended for Production)](#using-docker-recommended-for-production)
- [Command-Line Options](#command-line-options)
- [Environment Variables](#environment-variables)
- [Data Storage](#data-storage)
- [Logs](#logs)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before running the backend service, ensure you have:

### For Local Development
- Python 3.7+ installed
- Required packages installed: `pip install -r requirements.txt`
- SQLCipher v4.4.0 installed (for local database encryption)

### For Docker Deployment
- Docker installed
- Docker Compose (optional, for easier deployment)

## Running Methods

There are several ways to run the backend application, depending on your use case.

### Using Python Directly

The main entry point is `rotkehlchen/__main__.py`. You can run it using:

```bash
cd /path/to/Backend
python -m rotkehlchen
```

This will invoke the main function in `__main__.py`, which initializes the `RotkehlchenServer` class and starts the API server.

### Using the Entry Point Script

After installing the package with:

```bash
pip install -e .
```

You can simply run:

```bash
rotkehlchen
```

This works because `setup.py` registers a console script entry point:

```python
entry_points={
    'console_scripts': [
        'rotkehlchen = rotkehlchen.__main__:main',
    ],
}
```

### Using the Convenience Script

There's a convenience script in the root directory:

```bash
cd /path/to/Backend
./start_backend.sh
```

This simply runs `python -m rotkehlchen` after navigating to the correct directory.

### Using Docker (Recommended for Production)

#### Building and Running the Docker Image

```bash
# Build the Docker image
cd /path/to/Major_Project
docker build -t backend-service ./Backend

# Run the Docker container
docker run -p 4242:4242 -v /path/to/local/data:/data backend-service
```

#### Using Docker Compose

```bash
# In the directory with docker-compose.yml
docker-compose up
```

The Docker setup includes:
- Alpine-based minimal runtime
- Non-root user for security
- Volume mounts for persistent data
- Proper health checks
- Environment variable configuration

## Command-Line Options

The backend accepts various command-line arguments:

| Option | Description | Default |
|--------|-------------|---------|
| `--api-host` | Host to listen on | 127.0.0.1 |
| `--api-port` | Port to listen on | 4242 |
| `--data-dir` | Directory for data storage | Local data directory |
| `--api-cors` | CORS origins to allow | None |

Example:

```bash
python -m rotkehlchen --api-host 0.0.0.0 --api-port 4242 --data-dir /path/to/data --api-cors http://localhost:3000
```

## Environment Variables

When using Docker, you can configure the service using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `API_HOST` | Host to listen on | 0.0.0.0 |
| `API_PORT` | Port to listen on | 4242 |
| `DATA_DIR` | Directory for data storage | /data |
| `CORS_ORIGIN` | CORS origins to allow | http://localhost:3000 |

Example:

```bash
docker run -p 4242:4242 \
  -e API_HOST=0.0.0.0 \
  -e API_PORT=4242 \
  -e DATA_DIR=/data \
  -e CORS_ORIGIN=http://example.com \
  -v /path/to/local/data:/data \
  backend-service
```

## Data Storage

The backend stores data in SQLCipher-encrypted databases in the configured data directory. This includes:

- User credentials and settings
- Asset data and balances
- Historical trade data
- Cached API responses

For production deployment, ensure this data is backed up regularly and stored securely.

## Logs

Logs are written to the standard output and to the `/logs` directory in the Docker container. Mount this directory to persist logs:

```bash
docker run -v /path/to/local/logs:/logs backend-service
```

## Troubleshooting

### Common Issues

1. **Database Access Errors**
   - Ensure the data directory is writable by the application or container user
   - Check SQLCipher version compatibility (v4.4.0 required)

2. **Connection Refused Errors**
   - Verify the API_HOST and API_PORT settings
   - Ensure no other service is using the same port
   - Check if Docker port mapping is correctly configured

3. **API Endpoint Not Found**
   - All API endpoints are prefixed with `/api/1/`
   - Check the documentation for correct endpoint paths

### Health Check

The Docker container includes a health check that calls:

```
curl --fail http://localhost:4242/api/1/version
```

You can use this endpoint to verify the service is running correctly.

### Testing API Endpoints

Use the included test script to verify API functionality:

```bash
cd /path/to/Backend
./test_endpoints.sh
```

This will test basic API functionality including user creation, login, and settings management.
