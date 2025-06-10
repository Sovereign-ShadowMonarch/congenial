# Backend Setup Guide

This guide provides detailed instructions for setting up the backend service to work perfectly with the frontend application.

## System Requirements

- **Python**: Version 3.9 or 3.10 (recommended for compatibility with all dependencies)
- **SQLCipher**: Required for secure database encryption
- **C Compiler**: Required for building some Python dependencies

## Step 1: Install SQLCipher

SQLCipher is required for the encrypted database functionality. Install it according to your operating system:

### macOS

```bash
brew install sqlcipher
```

Verify the installation and find the path:
```bash
brew --prefix sqlcipher
```
Note the output path (typically `/opt/homebrew/opt/sqlcipher` on Apple Silicon or `/usr/local/opt/sqlcipher` on Intel Macs).

### Linux (Ubuntu/Debian)

```bash
sudo apt-get update
sudo apt-get install libsqlcipher-dev
```

### Windows

Download the pre-compiled binaries from the official website: https://www.zetetic.net/sqlcipher/open-source/

## Step 2: Set Up Python Environment

It's highly recommended to use Python 3.9 or 3.10 for maximum compatibility.

### Create a Virtual Environment

```bash
cd /Users/chakradharishiva/Desktop/Major_Project/Backend
python3.9 -m venv venv  # Replace with python3.10 if using Python 3.10
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### Upgrade pip

```bash
pip install --upgrade pip
```

## Step 3: Install Dependencies

With SQLCipher properly installed, we can now install the Python dependencies:

### Install pysqlcipher3 First

This is the most critical dependency that often causes issues:

```bash
# For macOS (adjust the path based on your brew --prefix sqlcipher output)
SQLCIPHER_PATH=/opt/homebrew/opt/sqlcipher pip install pysqlcipher3==1.0.3

# For Linux
pip install pysqlcipher3==1.0.3

# For Windows (adjust paths as needed)
set SQLCIPHER_PATH=C:\path\to\sqlcipher
pip install pysqlcipher3==1.0.3
```

### Install Remaining Dependencies

```bash
pip install -r requirements.txt
```

If you encounter any issues with specific packages, you can try installing them individually with their exact versions:

```bash
pip install gevent==21.1.2
pip install greenlet==1.0.0
pip install web3==5.15.0
# ... and so on
```

## Step 4: Initialize the Database

When you first run the application, you'll need to create a new user:

```bash
python -m rotkehlchen
```

You'll be prompted to create a new user. Enter your username and password. The password is used to encrypt your data, so make sure to remember it.

## Step 5: Configure API Endpoints

By default, the API server listens on `localhost:4242`. To adjust this or add CORS support for the frontend, you can use command-line arguments:

```bash
python -m rotkehlchen --api-cors="http://localhost:3000" --api-host="0.0.0.0" --api-port=4242
```

## Troubleshooting

### Common Issues and Solutions

#### Issue: pysqlcipher3 Installation Fails

**Solution**: Make sure SQLCipher is properly installed and the SQLCIPHER_PATH environment variable is correctly set:

```bash
# Check SQLCipher installation
which sqlcipher  # On Unix-like systems
```

#### Issue: greenlet or gevent Installation Fails

**Solution**: Install a compatible version:

```bash
pip install greenlet==1.0.0
pip install gevent==21.1.2
```

#### Issue: API Connection Refused

**Solution**: Make sure the API server is running and listening on the correct interface/port:

```bash
# Check if the process is running
ps aux | grep rotkehlchen

# Check if the port is in use
lsof -i :4242
```

#### Issue: Database Encryption Error

**Solution**: This usually happens if you forget your password or if the database is corrupted. You can reset the database by deleting the data directory (note that this will lose all your data):

```bash
# Find the data directory
python -c "from rotkehlchen.config import default_data_directory; print(default_data_directory())"

# Move/backup the directory
mv "$(python -c "from rotkehlchen.config import default_data_directory; print(default_data_directory())")" ~/rotki_data_backup

# Start fresh
python -m rotkehlchen
```

## Testing the API

You can test if the API is working correctly by making a simple request to the version endpoint:

```bash
curl http://localhost:4242/api/1/version
```

You should receive a JSON response with the version information.

## Next Steps

Once the backend is running successfully, you can start the frontend application which will connect to this API. See the main README.md for instructions on starting the frontend.
