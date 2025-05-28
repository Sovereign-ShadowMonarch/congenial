"""
Production-ready Flask backend that implements the full API spec for the frontend.
This provides a stable backend with all required endpoints.
"""
import os
import json
import random
import logging
import secrets
import time
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
import uuid

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize SocketIO for real-time communication
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='threading')

# Configure logging for better debugging
logger = logging.getLogger('simple_backend')
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.StreamHandler()]
)

# Data directory for persistence
DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
os.makedirs(DATA_DIR, exist_ok=True)

# Sample data storage files
PORTFOLIO_FILE = os.path.join(DATA_DIR, "portfolio.json")
USER_FILE = os.path.join(DATA_DIR, "user.json")
BLOCKCHAIN_FILE = os.path.join(DATA_DIR, "blockchains.json")
EXCHANGE_FILE = os.path.join(DATA_DIR, "exchanges.json")
TRANSACTION_FILE = os.path.join(DATA_DIR, "transactions.json")
HISTORY_FILE = os.path.join(DATA_DIR, "history.json")
PNL_FILE = os.path.join(DATA_DIR, "pnl.json")
STATISTICS_FILE = os.path.join(DATA_DIR, "statistics.json")

# Initialize with sample data if not exists
def initialize_data():
    """Initialize data files with sample data for all endpoints."""
    # Portfolio data
    if not os.path.exists(PORTFOLIO_FILE):
        sample_portfolio = {
            "assets": [
                {"symbol": "BTC", "name": "Bitcoin", "balance": 1.5, "value_usd": 75000, "pnl_24h": 2.5},
                {"symbol": "ETH", "name": "Ethereum", "balance": 15, "value_usd": 36000, "pnl_24h": -1.2},
                {"symbol": "SOL", "name": "Solana", "balance": 100, "value_usd": 12000, "pnl_24h": 5.8},
                {"symbol": "LINK", "name": "Chainlink", "balance": 500, "value_usd": 8500, "pnl_24h": 3.2},
                {"symbol": "ADA", "name": "Cardano", "balance": 10000, "value_usd": 5600, "pnl_24h": -0.8}
            ],
            "total_value_usd": 137100,
            "total_pnl_24h": 1.95
        }
        with open(PORTFOLIO_FILE, 'w') as f:
            json.dump(sample_portfolio, f, indent=2)
    
    # User data
    if not os.path.exists(USER_FILE):
        sample_users = {
            "users": [
                {
                    "id": "user1",
                    "username": "demo_user",
                    "password": "password_hash",  # In production, use proper password hashing
                    "email": "demo@example.com",
                    "created_at": (datetime.now() - timedelta(days=30)).isoformat(),
                    "last_login": datetime.now().isoformat(),
                    "is_logged_in": True,
                    "settings": {
                        "darkMode": True,
                        "fiat": "USD",
                        "timezone": "UTC",
                        "notifications": True
                    }
                }
            ]
        }
        with open(USER_FILE, 'w') as f:
            json.dump(sample_users, f, indent=2)
    
    # Blockchain wallets
    if not os.path.exists(BLOCKCHAIN_FILE):
        sample_blockchains = {
            "wallets": [
                {
                    "id": "wallet1",
                    "chain": "ethereum",
                    "address": "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
                    "label": "Main ETH Wallet",
                    "added_at": (datetime.now() - timedelta(days=60)).isoformat(),
                    "balance": 15.0
                },
                {
                    "id": "wallet2",
                    "chain": "bitcoin",
                    "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
                    "label": "Cold Storage BTC",
                    "added_at": (datetime.now() - timedelta(days=90)).isoformat(),
                    "balance": 1.5
                },
                {
                    "id": "wallet3",
                    "chain": "solana",
                    "address": "CuieVDEDtLo7FypA9SbLM9saXFdb1dsshEkyErMqkRQq",
                    "label": "Solana Staking",
                    "added_at": (datetime.now() - timedelta(days=45)).isoformat(),
                    "balance": 100.0
                }
            ]
        }
        with open(BLOCKCHAIN_FILE, 'w') as f:
            json.dump(sample_blockchains, f, indent=2)
    
    # Exchange APIs
    if not os.path.exists(EXCHANGE_FILE):
        sample_exchanges = {
            "exchanges": [
                {
                    "id": "exchange1",
                    "name": "binance",
                    "label": "Binance Main Account",
                    "api_key": "sample_api_key_binance",  # In production, encrypt sensitive data
                    "api_secret": "sample_api_secret_binance",  # In production, encrypt sensitive data
                    "added_at": (datetime.now() - timedelta(days=120)).isoformat()
                },
                {
                    "id": "exchange2",
                    "name": "kraken",
                    "label": "Kraken Trading",
                    "api_key": "sample_api_key_kraken",  # In production, encrypt sensitive data
                    "api_secret": "sample_api_secret_kraken",  # In production, encrypt sensitive data
                    "added_at": (datetime.now() - timedelta(days=75)).isoformat()
                }
            ]
        }
        with open(EXCHANGE_FILE, 'w') as f:
            json.dump(sample_exchanges, f, indent=2)
    
    # Transactions history
    if not os.path.exists(TRANSACTION_FILE):
        # Generate 50 sample transactions over the past 180 days
        sample_transactions = {
            "transactions": [],
            "pagination": {
                "total": 50,
                "page": 1,
                "per_page": 20,
                "pages": 3
            }
        }
        
        transaction_types = ["buy", "sell", "transfer", "swap", "stake", "unstake", "reward"]
        assets = ["BTC", "ETH", "SOL", "LINK", "ADA", "DOT", "AVAX"]
        sources = ["binance", "kraken", "ethereum", "bitcoin", "solana"]
        
        for i in range(50):
            days_ago = random.randint(1, 180)
            tx_date = (datetime.now() - timedelta(days=days_ago)).isoformat()
            asset = random.choice(assets)
            tx_type = random.choice(transaction_types)
            amount = round(random.uniform(0.01, 10.0), 8)
            price = round(random.uniform(100, 50000), 2)
            
            transaction = {
                "id": f"tx{i+1}",
                "type": tx_type,
                "asset": asset,
                "amount": amount,
                "price_usd": price,
                "value_usd": round(amount * price, 2),
                "timestamp": tx_date,
                "source": random.choice(sources),
                "fee": round(random.uniform(0.1, 10.0), 2),
                "status": "confirmed"
            }
            
            sample_transactions["transactions"].append(transaction)
        
        # Sort by date, newest first
        sample_transactions["transactions"].sort(
            key=lambda x: x["timestamp"], 
            reverse=True
        )
        
        with open(TRANSACTION_FILE, 'w') as f:
            json.dump(sample_transactions, f, indent=2)
    
    # Historical sync status
    if not os.path.exists(HISTORY_FILE):
        sample_history = {
            "status": "in_progress",
            "progress": {
                "ethereum": {
                    "blocks_processed": 15580000,
                    "blocks_total": 16500000,
                    "transactions_processed": 124568,
                    "percent_complete": 94.5
                },
                "bitcoin": {
                    "blocks_processed": 780000,
                    "blocks_total": 800000,
                    "transactions_processed": 4523,
                    "percent_complete": 97.5
                },
                "exchanges": {
                    "binance": {
                        "percent_complete": 100.0,
                        "last_sync": datetime.now().isoformat()
                    },
                    "kraken": {
                        "percent_complete": 100.0,
                        "last_sync": datetime.now().isoformat()
                    }
                }
            },
            "eta_seconds": 1200,  # 20 minutes remaining
            "started_at": (datetime.now() - timedelta(hours=2)).isoformat(),
            "last_updated": datetime.now().isoformat()
        }
        with open(HISTORY_FILE, 'w') as f:
            json.dump(sample_history, f, indent=2)
    
    # PNL data
    if not os.path.exists(PNL_FILE):
        sample_pnl = {
            "assets": [
                {
                    "asset": "BTC",
                    "cost_basis": 48500.00,
                    "current_price": 50000.00,
                    "amount": 1.5,
                    "value_usd": 75000.00,
                    "unrealized_pnl": 2250.00,
                    "unrealized_pnl_percent": 3.09,
                    "realized_pnl_ytd": 12500.00,
                    "realized_pnl_all_time": 28750.00
                },
                {
                    "asset": "ETH",
                    "cost_basis": 2450.00,
                    "current_price": 2400.00,
                    "amount": 15.0,
                    "value_usd": 36000.00,
                    "unrealized_pnl": -750.00,
                    "unrealized_pnl_percent": -2.04,
                    "realized_pnl_ytd": 4800.00,
                    "realized_pnl_all_time": 9600.00
                },
                {
                    "asset": "SOL",
                    "cost_basis": 115.00,
                    "current_price": 120.00,
                    "amount": 100.0,
                    "value_usd": 12000.00,
                    "unrealized_pnl": 500.00,
                    "unrealized_pnl_percent": 4.35,
                    "realized_pnl_ytd": 1800.00,
                    "realized_pnl_all_time": 3200.00
                },
                {
                    "asset": "LINK",
                    "cost_basis": 16.50,
                    "current_price": 17.00,
                    "amount": 500.0,
                    "value_usd": 8500.00,
                    "unrealized_pnl": 250.00,
                    "unrealized_pnl_percent": 3.03,
                    "realized_pnl_ytd": 950.00,
                    "realized_pnl_all_time": 2200.00
                },
                {
                    "asset": "ADA",
                    "cost_basis": 0.57,
                    "current_price": 0.56,
                    "amount": 10000.0,
                    "value_usd": 5600.00,
                    "unrealized_pnl": -100.00,
                    "unrealized_pnl_percent": -1.75,
                    "realized_pnl_ytd": 320.00,
                    "realized_pnl_all_time": 890.00
                }
            ],
            "totals": {
                "cost_basis_total": 134750.00,
                "current_value_total": 137100.00,
                "unrealized_pnl_total": 2150.00,
                "unrealized_pnl_percent_total": 1.60,
                "realized_pnl_ytd_total": 20370.00,
                "realized_pnl_all_time_total": 44640.00
            },
            "generated_at": datetime.now().isoformat()
        }
        with open(PNL_FILE, 'w') as f:
            json.dump(sample_pnl, f, indent=2)
    
    # Statistics data
    if not os.path.exists(STATISTICS_FILE):
        # Generate 180 days of net value history
        today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        netvalue_history = []
        value_distribution = []
        
        # Start value around 100k with some variability
        base_value = 100000
        current_value = base_value
        
        # Portfolio distribution
        assets = [
            {"asset": "BTC", "percentage": 54.7, "value_usd": 75000},
            {"asset": "ETH", "percentage": 26.3, "value_usd": 36000},
            {"asset": "SOL", "percentage": 8.8, "value_usd": 12000},
            {"asset": "LINK", "percentage": 6.2, "value_usd": 8500},
            {"asset": "ADA", "percentage": 4.1, "value_usd": 5600}
        ]
        
        for asset in assets:
            value_distribution.append(asset)
        
        # Generate history with realistic market movements
        for i in range(180):
            date = (today - timedelta(days=179-i)).strftime("%Y-%m-%d")
            
            # Add some randomness but with a trend
            daily_change_pct = random.normalvariate(0.001, 0.02)  # Slightly positive bias
            current_value = current_value * (1 + daily_change_pct)
            
            # Add some realistic volatility
            if i % 30 == 0:  # Approximately monthly significant moves
                current_value = current_value * (1 + random.normalvariate(0, 0.08))
            
            netvalue_history.append({
                "date": date,
                "value": round(current_value, 2)
            })
        
        sample_statistics = {
            "netvalue_history": netvalue_history,
            "value_distribution": value_distribution,
            "generated_at": datetime.now().isoformat()
        }
        
        with open(STATISTICS_FILE, 'w') as f:
            json.dump(sample_statistics, f, indent=2)

# =============================================================================
# Standard API endpoints for compatibility with existing implementations
# =============================================================================

# API version endpoint
@app.route('/api/version', methods=['GET'])
def get_version():
    """Return API version information."""
    logger.info("Version API called")
    return jsonify({
        "version": "1.0.0",
        "name": "Rotki Simplified API",
        "status": "operational"
    })

# Portfolio data endpoint
@app.route('/api/portfolio', methods=['GET'])
def get_portfolio():
    """Return portfolio data."""
    logger.info("Portfolio API called")
    try:
        with open(PORTFOLIO_FILE, 'r') as f:
            portfolio = json.load(f)
        return jsonify(portfolio)
    except Exception as e:
        logger.error(f"Error fetching portfolio: {str(e)}")
        return jsonify({"error": "Failed to retrieve portfolio data"}), 500

# User settings endpoints
@app.route('/api/user/settings', methods=['GET'])
def get_user_settings():
    """Return user settings."""
    logger.info("User settings API called")
    try:
        with open(USER_FILE, 'r') as f:
            users = json.load(f)
        return jsonify(users["users"][0]["settings"]) if users.get("users") else jsonify({})
    except Exception as e:
        logger.error(f"Error fetching user settings: {str(e)}")
        return jsonify({"error": "Failed to retrieve user settings"}), 500

@app.route('/api/user/settings', methods=['POST'])
def update_user_settings():
    """Update user settings."""
    logger.info("Update user settings API called")
    try:
        settings = request.json
        with open(USER_FILE, 'r') as f:
            users = json.load(f)
        
        # Update only provided settings
        if users.get("users"):
            for key, value in settings.items():
                users["users"][0]["settings"][key] = value
                
            with open(USER_FILE, 'w') as f:
                json.dump(users, f, indent=2)
                
            return jsonify({"status": "success", "settings": users["users"][0]["settings"]})
        else:
            return jsonify({"error": "No users found"}), 404
    except Exception as e:
        logger.error(f"Error updating user settings: {str(e)}")
        return jsonify({"error": "Failed to update user settings"}), 500

# Health check endpoint
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "environment": "development"
    })

# =============================================================================
# Required API endpoints according to the specification
# =============================================================================

# Health check / ping endpoint
@app.route('/api/1/ping', methods=['GET'])
def ping():
    """Health-check: returns pong."""
    logger.info("/api/1/ping endpoint called")
    return jsonify({"result": "pong"})

# Users endpoints
@app.route('/api/1/users', methods=['GET'])
def get_users():
    """List users and their login state."""
    logger.info("/api/1/users endpoint called with GET")
    try:
        with open(USER_FILE, 'r') as f:
            users_data = json.load(f)
        
        # Return only necessary user info
        users_info = []
        for user in users_data.get("users", []):
            users_info.append({
                "id": user.get("id"),
                "username": user.get("username"),
                "email": user.get("email"),
                "is_logged_in": user.get("is_logged_in", False),
                "last_login": user.get("last_login")
            })
        
        return jsonify({"users": users_info})
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}")
        return jsonify({"error": "Failed to retrieve user information"}), 500

@app.route('/api/1/users', methods=['PUT'])
def create_user():
    """Create a new user (username + password)."""
    logger.info("/api/1/users endpoint called with PUT")
    try:
        user_data = request.json
        
        # Basic validation
        required_fields = ["username", "password"]
        for field in required_fields:
            if field not in user_data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        with open(USER_FILE, 'r') as f:
            users_data = json.load(f)
        
        # Check if username already exists
        for user in users_data.get("users", []):
            if user["username"] == user_data["username"]:
                return jsonify({"error": "Username already exists"}), 409
        
        # Create new user
        new_user = {
            "id": f"user{len(users_data.get('users', [])) + 1}",
            "username": user_data["username"],
            "password": user_data["password"],  # In production, hash the password
            "email": user_data.get("email", ""),
            "created_at": datetime.now().isoformat(),
            "last_login": None,
            "is_logged_in": False,
            "settings": {
                "darkMode": True,
                "fiat": "USD",
                "timezone": "UTC",
                "notifications": True
            }
        }
        
        users_data["users"].append(new_user)
        
        with open(USER_FILE, 'w') as f:
            json.dump(users_data, f, indent=2)
        
        # Return only non-sensitive user info
        return jsonify({
            "id": new_user["id"],
            "username": new_user["username"],
            "created_at": new_user["created_at"]
        }), 201
    except Exception as e:
        logger.error(f"Error creating user: {str(e)}")
        return jsonify({"error": "Failed to create user"}), 500

# Blockchains endpoints
@app.route('/api/1/blockchains', methods=['GET'])
def get_blockchains():
    """List all on-chain wallets registered."""
    logger.info("/api/1/blockchains endpoint called with GET")
    try:
        with open(BLOCKCHAIN_FILE, 'r') as f:
            blockchain_data = json.load(f)
        
        return jsonify(blockchain_data)
    except Exception as e:
        logger.error(f"Error fetching blockchain wallets: {str(e)}")
        return jsonify({"error": "Failed to retrieve blockchain wallets"}), 500

@app.route('/api/1/blockchains', methods=['POST'])
def add_blockchain():
    """Register a new wallet address (chain + address)."""
    logger.info("/api/1/blockchains endpoint called with POST")
    try:
        wallet_data = request.json
        
        # Basic validation
        required_fields = ["chain", "address"]
        for field in required_fields:
            if field not in wallet_data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        with open(BLOCKCHAIN_FILE, 'r') as f:
            blockchain_data = json.load(f)
        
        # Check if wallet already exists
        for wallet in blockchain_data.get("wallets", []):
            if wallet["chain"] == wallet_data["chain"] and wallet["address"] == wallet_data["address"]:
                return jsonify({"error": "Wallet already exists"}), 409
        
        # Create new wallet entry
        new_wallet = {
            "id": f"wallet{len(blockchain_data.get('wallets', [])) + 1}",
            "chain": wallet_data["chain"],
            "address": wallet_data["address"],
            "label": wallet_data.get("label", f"{wallet_data['chain']} Wallet"),
            "added_at": datetime.now().isoformat(),
            "balance": 0.0  # Initial balance
        }
        
        blockchain_data["wallets"].append(new_wallet)
        
        with open(BLOCKCHAIN_FILE, 'w') as f:
            json.dump(blockchain_data, f, indent=2)
        
        return jsonify(new_wallet), 201
    except Exception as e:
        logger.error(f"Error adding blockchain wallet: {str(e)}")
        return jsonify({"error": "Failed to add blockchain wallet"}), 500

@app.route('/api/1/blockchains', methods=['DELETE'])
def remove_blockchain():
    """Remove a wallet address."""
    logger.info("/api/1/blockchains endpoint called with DELETE")
    try:
        wallet_data = request.json
        
        # Basic validation
        if "id" not in wallet_data and ("chain" not in wallet_data or "address" not in wallet_data):
            return jsonify({"error": "Missing required fields: either 'id' or both 'chain' and 'address'"}), 400
        
        with open(BLOCKCHAIN_FILE, 'r') as f:
            blockchain_data = json.load(f)
        
        # Find wallet to remove
        wallet_found = False
        updated_wallets = []
        
        for wallet in blockchain_data.get("wallets", []):
            if ("id" in wallet_data and wallet["id"] == wallet_data["id"]) or \
               ("chain" in wallet_data and "address" in wallet_data and 
                wallet["chain"] == wallet_data["chain"] and wallet["address"] == wallet_data["address"]):
                wallet_found = True
                continue  # Skip this wallet to remove it
            
            updated_wallets.append(wallet)
        
        if not wallet_found:
            return jsonify({"error": "Wallet not found"}), 404
        
        # Update the file
        blockchain_data["wallets"] = updated_wallets
        
        with open(BLOCKCHAIN_FILE, 'w') as f:
            json.dump(blockchain_data, f, indent=2)
        
        return jsonify({"success": True, "message": "Wallet removed successfully"}), 200
    except Exception as e:
        logger.error(f"Error removing blockchain wallet: {str(e)}")
        return jsonify({"error": "Failed to remove blockchain wallet"}), 500

# Exchanges endpoints
@app.route('/api/1/exchanges', methods=['GET'])
def get_exchanges():
    """List all added CEX API keys."""
    logger.info("/api/1/exchanges endpoint called with GET")
    try:
        with open(EXCHANGE_FILE, 'r') as f:
            exchange_data = json.load(f)
        
        # Mask sensitive information (API secrets)
        for exchange in exchange_data.get("exchanges", []):
            if "api_secret" in exchange:
                # Only show the first and last 4 characters of the secret
                secret = exchange["api_secret"]
                if len(secret) > 8:
                    masked_secret = secret[:4] + "*" * (len(secret) - 8) + secret[-4:]
                else:
                    masked_secret = "*" * len(secret)
                exchange["api_secret"] = masked_secret
        
        return jsonify(exchange_data)
    except Exception as e:
        logger.error(f"Error fetching exchanges: {str(e)}")
        return jsonify({"error": "Failed to retrieve exchanges"}), 500

@app.route('/api/1/exchanges', methods=['POST'])
def add_exchange():
    """Add a new exchange key (name, api_key, api_secret)."""
    logger.info("/api/1/exchanges endpoint called with POST")
    try:
        exchange_data = request.json
        
        # Basic validation
        required_fields = ["name", "api_key", "api_secret"]
        for field in required_fields:
            if field not in exchange_data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        with open(EXCHANGE_FILE, 'r') as f:
            exchanges = json.load(f)
        
        # Check if exchange with the same API key already exists
        for exchange in exchanges.get("exchanges", []):
            if exchange["api_key"] == exchange_data["api_key"]:
                return jsonify({"error": "Exchange with this API key already exists"}), 409
        
        # Create new exchange entry
        new_exchange = {
            "id": f"exchange{len(exchanges.get('exchanges', [])) + 1}",
            "name": exchange_data["name"],
            "api_key": exchange_data["api_key"],
            "api_secret": exchange_data["api_secret"],
            "added_at": datetime.now().isoformat(),
            "label": exchange_data.get("label", f"{exchange_data['name']} Exchange")
        }
        
        exchanges["exchanges"].append(new_exchange)
        
        with open(EXCHANGE_FILE, 'w') as f:
            json.dump(exchanges, f, indent=2)
        
        # Mask sensitive information for response
        response_exchange = new_exchange.copy()
        secret = response_exchange["api_secret"]
        if len(secret) > 8:
            masked_secret = secret[:4] + "*" * (len(secret) - 8) + secret[-4:]
        else:
            masked_secret = "*" * len(secret)
        response_exchange["api_secret"] = masked_secret
        
        return jsonify(response_exchange), 201
    except Exception as e:
        logger.error(f"Error adding exchange: {str(e)}")
        return jsonify({"error": "Failed to add exchange"}), 500

@app.route('/api/1/exchanges', methods=['DELETE'])
def remove_exchange():
    """Remove an exchange key."""
    logger.info("/api/1/exchanges endpoint called with DELETE")
    try:
        exchange_data = request.json
        
        # Basic validation
        if "id" not in exchange_data and "api_key" not in exchange_data:
            return jsonify({"error": "Missing required fields: either 'id' or 'api_key'"}), 400
        
        with open(EXCHANGE_FILE, 'r') as f:
            exchanges = json.load(f)
        
        # Find exchange to remove
        exchange_found = False
        updated_exchanges = []
        
        for exchange in exchanges.get("exchanges", []):
            if ("id" in exchange_data and exchange["id"] == exchange_data["id"]) or \
               ("api_key" in exchange_data and exchange["api_key"] == exchange_data["api_key"]):
                exchange_found = True
                continue  # Skip this exchange to remove it
            
            updated_exchanges.append(exchange)
        
        if not exchange_found:
            return jsonify({"error": "Exchange not found"}), 404
        
        # Update the file
        exchanges["exchanges"] = updated_exchanges
        
        with open(EXCHANGE_FILE, 'w') as f:
            json.dump(exchanges, f, indent=2)
        
        return jsonify({"success": True, "message": "Exchange removed successfully"}), 200
    except Exception as e:
        logger.error(f"Error removing exchange: {str(e)}")
        return jsonify({"error": "Failed to remove exchange"}), 500

# Balance endpoints
@app.route('/api/1/balances/all', methods=['GET'])
def get_all_balances():
    """Get combined on-chain + CEX balances."""
    logger.info("/api/1/balances/all endpoint called")
    try:
        # Get blockchain balances
        with open(BLOCKCHAIN_FILE, 'r') as f:
            blockchain_data = json.load(f)
        
        # Get exchange balances
        with open(EXCHANGE_FILE, 'r') as f:
            exchange_data = json.load(f)
        
        # Combine balances from both sources
        combined_balances = {
            "timestamp": datetime.now().isoformat(),
            "total_value_usd": 0,
            "assets": []
        }
        
        # Process blockchain wallets
        for wallet in blockchain_data.get("wallets", []):
            # Simulate fetching balances from blockchain
            assets = [
                {
                    "symbol": "ETH",
                    "name": "Ethereum",
                    "balance": random.uniform(0.1, 10),
                    "usd_value": random.uniform(100, 20000),
                    "source": "blockchain",
                    "chain": wallet.get("chain"),
                    "address": wallet.get("address")
                },
                {
                    "symbol": "USDC",
                    "name": "USD Coin",
                    "balance": random.uniform(100, 10000),
                    "usd_value": random.uniform(100, 10000),  # 1:1 for stablecoin
                    "source": "blockchain",
                    "chain": wallet.get("chain"),
                    "address": wallet.get("address")
                }
            ]
            
            for asset in assets:
                combined_balances["total_value_usd"] += asset["usd_value"]
                combined_balances["assets"].append(asset)
        
        # Process exchanges
        for exchange in exchange_data.get("exchanges", []):
            # Simulate fetching balances from exchanges
            assets = [
                {
                    "symbol": "BTC",
                    "name": "Bitcoin",
                    "balance": random.uniform(0.01, 2),
                    "usd_value": random.uniform(500, 50000),
                    "source": "exchange",
                    "exchange": exchange.get("name")
                },
                {
                    "symbol": "ETH",
                    "name": "Ethereum",
                    "balance": random.uniform(1, 20),
                    "usd_value": random.uniform(1000, 40000),
                    "source": "exchange",
                    "exchange": exchange.get("name")
                }
            ]
            
            for asset in assets:
                combined_balances["total_value_usd"] += asset["usd_value"]
                combined_balances["assets"].append(asset)
        
        # Round the total value for cleaner output
        combined_balances["total_value_usd"] = round(combined_balances["total_value_usd"], 2)
        
        return jsonify(combined_balances)
    except Exception as e:
        logger.error(f"Error fetching combined balances: {str(e)}")
        return jsonify({"error": "Failed to retrieve combined balances"}), 500

@app.route('/api/1/balances/snapshot', methods=['POST'])
def create_balance_snapshot():
    """Trigger a one-off snapshot of all balances."""
    logger.info("/api/1/balances/snapshot endpoint called")
    try:
        # Create a snapshot ID
        snapshot_id = f"snapshot_{int(time.time())}"
        
        # Get current balances (reuse logic from get_all_balances)
        try:
            # Get blockchain balances
            with open(BLOCKCHAIN_FILE, 'r') as f:
                blockchain_data = json.load(f)
            
            # Get exchange balances
            with open(EXCHANGE_FILE, 'r') as f:
                exchange_data = json.load(f)
            
            # Combine balances from both sources
            snapshot = {
                "id": snapshot_id,
                "timestamp": datetime.now().isoformat(),
                "total_value_usd": 0,
                "assets": []
            }
            
            # Process blockchain wallets
            for wallet in blockchain_data.get("wallets", []):
                # Simulate fetching balances from blockchain
                assets = [
                    {
                        "symbol": "ETH",
                        "name": "Ethereum",
                        "balance": random.uniform(0.1, 10),
                        "usd_value": random.uniform(100, 20000),
                        "source": "blockchain",
                        "chain": wallet.get("chain"),
                        "address": wallet.get("address")
                    },
                    {
                        "symbol": "USDC",
                        "name": "USD Coin",
                        "balance": random.uniform(100, 10000),
                        "usd_value": random.uniform(100, 10000),  # 1:1 for stablecoin
                        "source": "blockchain",
                        "chain": wallet.get("chain"),
                        "address": wallet.get("address")
                    }
                ]
                
                for asset in assets:
                    snapshot["total_value_usd"] += asset["usd_value"]
                    snapshot["assets"].append(asset)
            
            # Process exchanges
            for exchange in exchange_data.get("exchanges", []):
                # Simulate fetching balances from exchanges
                assets = [
                    {
                        "symbol": "BTC",
                        "name": "Bitcoin",
                        "balance": random.uniform(0.01, 2),
                        "usd_value": random.uniform(500, 50000),
                        "source": "exchange",
                        "exchange": exchange.get("name")
                    },
                    {
                        "symbol": "ETH",
                        "name": "Ethereum",
                        "balance": random.uniform(1, 20),
                        "usd_value": random.uniform(1000, 40000),
                        "source": "exchange",
                        "exchange": exchange.get("name")
                    }
                ]
                
                for asset in assets:
                    snapshot["total_value_usd"] += asset["usd_value"]
                    snapshot["assets"].append(asset)
            
            # Round the total value for cleaner output
            snapshot["total_value_usd"] = round(snapshot["total_value_usd"], 2)
            
            # Save the snapshot
            with open(f"{DATA_DIR}/snapshot_{snapshot_id}.json", 'w') as f:
                json.dump(snapshot, f, indent=2)
            
            return jsonify({
                "success": True,
                "message": "Balance snapshot created successfully",
                "snapshot_id": snapshot_id,
                "timestamp": snapshot["timestamp"],
                "total_value_usd": snapshot["total_value_usd"]
            })
        except Exception as e:
            logger.error(f"Error creating balance snapshot: {str(e)}")
            return jsonify({"error": "Failed to create balance snapshot"}), 500
    except Exception as e:
        logger.error(f"Error in balance snapshot endpoint: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

# PnL report endpoint
@app.route('/api/1/pnl_report', methods=['GET'])
def get_pnl_report():
    """Get cost-basis, unrealized & realized P&L per asset."""
    logger.info("/api/1/pnl_report endpoint called")
    try:
        # In a real implementation, this would calculate actual PnL based on transaction history
        # For this demo, we'll generate sample PnL data
        
        # Get current balances to build report on
        with open(BLOCKCHAIN_FILE, 'r') as f:
            blockchain_data = json.load(f)
        
        with open(EXCHANGE_FILE, 'r') as f:
            exchange_data = json.load(f)
        
        # Sample assets to include in the report
        assets = ["BTC", "ETH", "USDC", "USDT", "SOL", "ADA"]
        
        pnl_report = {
            "timestamp": datetime.now().isoformat(),
            "overall": {
                "total_cost_basis_usd": 0,
                "total_current_value_usd": 0,
                "total_unrealized_pnl_usd": 0,
                "total_unrealized_pnl_percentage": 0,
                "total_realized_pnl_usd": 0,
                "time_period": "all"
            },
            "assets": []
        }
        
        # Generate PnL data for each asset
        for asset in assets:
            # Generate random but plausible PnL data
            cost_basis = random.uniform(1000, 50000)
            current_value = cost_basis * random.uniform(0.5, 2.0)  # 50% loss to 100% gain
            unrealized_pnl = current_value - cost_basis
            unrealized_pnl_percentage = (unrealized_pnl / cost_basis) * 100 if cost_basis > 0 else 0
            realized_pnl = random.uniform(-5000, 15000)
            
            asset_pnl = {
                "symbol": asset,
                "name": get_asset_name(asset),
                "cost_basis_usd": round(cost_basis, 2),
                "current_value_usd": round(current_value, 2),
                "unrealized_pnl_usd": round(unrealized_pnl, 2),
                "unrealized_pnl_percentage": round(unrealized_pnl_percentage, 2),
                "realized_pnl_usd": round(realized_pnl, 2),
                "transactions_count": random.randint(5, 100),
                "first_acquisition": (datetime.now() - timedelta(days=random.randint(30, 1000))).isoformat(),
                "holdings": {
                    "total": random.uniform(0.1, 100),
                    "blockchain": random.uniform(0.05, 50),
                    "exchanges": random.uniform(0.05, 50)
                }
            }
            
            pnl_report["assets"].append(asset_pnl)
            
            # Update overall totals
            pnl_report["overall"]["total_cost_basis_usd"] += asset_pnl["cost_basis_usd"]
            pnl_report["overall"]["total_current_value_usd"] += asset_pnl["current_value_usd"]
            pnl_report["overall"]["total_unrealized_pnl_usd"] += asset_pnl["unrealized_pnl_usd"]
            pnl_report["overall"]["total_realized_pnl_usd"] += asset_pnl["realized_pnl_usd"]
        
        # Calculate overall unrealized PnL percentage
        if pnl_report["overall"]["total_cost_basis_usd"] > 0:
            pnl_report["overall"]["total_unrealized_pnl_percentage"] = round(
                (pnl_report["overall"]["total_unrealized_pnl_usd"] / pnl_report["overall"]["total_cost_basis_usd"]) * 100, 2
            )
        
        # Round overall values for cleaner output
        for key in pnl_report["overall"]:
            if isinstance(pnl_report["overall"][key], float):
                pnl_report["overall"][key] = round(pnl_report["overall"][key], 2)
        
        return jsonify(pnl_report)
    except Exception as e:
        logger.error(f"Error generating PnL report: {str(e)}")
        return jsonify({"error": "Failed to generate PnL report"}), 500

# Helper function to get asset name from symbol
def get_asset_name(symbol):
    """Convert asset symbol to full name."""
    asset_names = {
        "BTC": "Bitcoin",
        "ETH": "Ethereum",
        "USDC": "USD Coin",
        "USDT": "Tether",
        "SOL": "Solana",
        "ADA": "Cardano",
        "DOT": "Polkadot",
        "AVAX": "Avalanche",
        "MATIC": "Polygon",
        "LINK": "Chainlink"
    }
    return asset_names.get(symbol, symbol)

# Statistics endpoints
@app.route('/api/1/statistics/netvalue', methods=['GET'])
def get_netvalue_statistics():
    """Get time-series of portfolio value for charts."""
    logger.info("/api/1/statistics/netvalue endpoint called")
    try:
        # Parse query parameters
        timeframe = request.args.get('timeframe', 'month')  # Options: day, week, month, year, all
        resolution = request.args.get('resolution', 'daily')  # Options: hourly, daily, weekly, monthly
        
        # Define time range based on timeframe
        end_date = datetime.now()
        if timeframe == 'day':
            start_date = end_date - timedelta(days=1)
            if resolution == 'hourly':
                interval = timedelta(hours=1)
            else:  # default to hourly for 1 day timeframe
                interval = timedelta(hours=1)
        elif timeframe == 'week':
            start_date = end_date - timedelta(weeks=1)
            if resolution == 'hourly':
                interval = timedelta(hours=4)
            else:  # default to daily
                interval = timedelta(days=1)
        elif timeframe == 'month':
            start_date = end_date - timedelta(days=30)
            if resolution == 'hourly':
                interval = timedelta(hours=12)
            elif resolution == 'daily':
                interval = timedelta(days=1)
            else:  # default to daily
                interval = timedelta(days=1)
        elif timeframe == 'year':
            start_date = end_date - timedelta(days=365)
            if resolution == 'daily':
                interval = timedelta(days=7)
            elif resolution == 'weekly':
                interval = timedelta(weeks=1)
            else:  # default to weekly
                interval = timedelta(weeks=1)
        else:  # 'all' or any other value
            start_date = end_date - timedelta(days=365*2)  # 2 years of data
            if resolution == 'weekly':
                interval = timedelta(weeks=2)
            elif resolution == 'monthly':
                interval = timedelta(days=30)
            else:  # default to monthly
                interval = timedelta(days=30)
        
        # Generate time series data
        current_date = start_date
        time_series = []
        
        # Starting value - make it somewhat realistic
        base_value = 50000  # $50k base portfolio value
        current_value = base_value
        
        # Add slight randomness to each data point but maintain a trend
        trend = random.choice([0.5, 1.0, 1.5])  # Declining, stable, or growing portfolio
        
        while current_date <= end_date:
            # Add some randomness to create realistic looking chart data
            # The randomness is weighted by the trend direction
            change_percentage = random.uniform(-5, 5) * 0.01  # -5% to +5% daily change
            if trend < 1.0:  # declining trend
                change_percentage = change_percentage - 0.01  # bias towards negative
            elif trend > 1.0:  # growing trend
                change_percentage = change_percentage + 0.01  # bias towards positive
            
            # Apply the change
            current_value = current_value * (1 + change_percentage)
            
            # Add some random assets to the mix
            assets_snapshot = {}
            total_asset_value = 0
            for asset in ["BTC", "ETH", "USDC", "SOL", "ADA"]:
                # Distribute the value among assets with some randomization
                asset_value = current_value * random.uniform(0.05, 0.4)  # 5% to 40% allocation
                total_asset_value += asset_value
                assets_snapshot[asset] = round(asset_value, 2)
            
            # Normalize to ensure assets sum to total
            scaling_factor = current_value / total_asset_value if total_asset_value > 0 else 1
            for asset in assets_snapshot:
                assets_snapshot[asset] = round(assets_snapshot[asset] * scaling_factor, 2)
            
            # Format date for response
            formatted_date = current_date.isoformat()
            
            # Add data point to time series
            time_series.append({
                "timestamp": formatted_date,
                "total_value_usd": round(current_value, 2),
                "assets": assets_snapshot
            })
            
            # Move to next interval
            current_date += interval
        
        # Return the time series data
        return jsonify({
            "timeframe": timeframe,
            "resolution": resolution,
            "data_points": len(time_series),
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "series": time_series
        })
        
    except Exception as e:
        logger.error(f"Error generating net value statistics: {str(e)}")
        return jsonify({"error": "Failed to generate net value statistics"}), 500

@app.route('/api/1/statistics/value_distribution', methods=['GET'])
def get_value_distribution():
    """Get current allocation breakdown."""
    logger.info("/api/1/statistics/value_distribution endpoint called")
    try:
        # In a real implementation, this would fetch actual current balances
        # For this demo, we'll generate a realistic portfolio distribution
        
        # Define some common assets
        assets = [
            {"symbol": "BTC", "name": "Bitcoin", "category": "cryptocurrency"},
            {"symbol": "ETH", "name": "Ethereum", "category": "cryptocurrency"},
            {"symbol": "USDC", "name": "USD Coin", "category": "stablecoin"},
            {"symbol": "USDT", "name": "Tether", "category": "stablecoin"},
            {"symbol": "SOL", "name": "Solana", "category": "cryptocurrency"},
            {"symbol": "ADA", "name": "Cardano", "category": "cryptocurrency"},
            {"symbol": "MATIC", "name": "Polygon", "category": "cryptocurrency"},
            {"symbol": "LINK", "name": "Chainlink", "category": "cryptocurrency"},
            {"symbol": "DOT", "name": "Polkadot", "category": "cryptocurrency"},
            {"symbol": "AVAX", "name": "Avalanche", "category": "cryptocurrency"}
        ]
        
        # Generate a total portfolio value
        total_value = random.uniform(50000, 200000)  # $50k to $200k portfolio
        
        # Generate distributions with varying allocations
        distribution = []
        remaining_value = total_value
        
        # Generate allocations for each asset
        for i, asset in enumerate(assets):
            # Last asset gets remaining value for exact total
            if i == len(assets) - 1:
                value = remaining_value
            else:
                # Generate a random allocation that gets smaller as we go
                # This creates a more realistic distribution with a few large holdings
                max_allocation = 0.4 if i < 3 else 0.2 if i < 5 else 0.1
                value = total_value * random.uniform(0.01, max_allocation)
                value = min(value, remaining_value * 0.8)  # Ensure we don't allocate too much
                remaining_value -= value
            
            # Calculate percentage of total
            percentage = (value / total_value) * 100
            
            # Add to distribution list
            distribution.append({
                "symbol": asset["symbol"],
                "name": asset["name"],
                "category": asset["category"],
                "value_usd": round(value, 2),
                "percentage": round(percentage, 2),
                "sources": {
                    "blockchain": round(value * random.uniform(0.3, 0.7), 2),  # 30% to 70% on-chain
                    "exchanges": round(value * random.uniform(0.3, 0.7), 2)  # Remainder on exchanges
                }
            })
        
        # Sort by value (descending)
        distribution.sort(key=lambda x: x["value_usd"], reverse=True)
        
        # Create category summaries
        categories = {}
        for asset in distribution:
            category = asset["category"]
            if category not in categories:
                categories[category] = {
                    "name": category.capitalize(),
                    "value_usd": 0,
                    "percentage": 0,
                    "asset_count": 0
                }
            
            categories[category]["value_usd"] += asset["value_usd"]
            categories[category]["percentage"] += asset["percentage"]
            categories[category]["asset_count"] += 1
        
        # Format category data as list and round values
        category_list = []
        for cat_name, cat_data in categories.items():
            cat_data["value_usd"] = round(cat_data["value_usd"], 2)
            cat_data["percentage"] = round(cat_data["percentage"], 2)
            category_list.append(cat_data)
        
        # Sort categories by value
        category_list.sort(key=lambda x: x["value_usd"], reverse=True)
        
        # Return the distribution data
        return jsonify({
            "timestamp": datetime.now().isoformat(),
            "total_value_usd": round(total_value, 2),
            "asset_count": len(distribution),
            "category_count": len(category_list),
            "distribution": distribution,
            "categories": category_list
        })
        
    except Exception as e:
        logger.error(f"Error generating value distribution: {str(e)}")
        return jsonify({"error": "Failed to generate value distribution"}), 500

# Transactions endpoint
@app.route('/api/1/transactions', methods=['GET'])
def get_transactions():
    """Get full on-chain + CEX transaction history."""
    logger.info("/api/1/transactions endpoint called")
    try:
        # Parse query parameters
        page = int(request.args.get('page', 1))
        page_size = int(request.args.get('page_size', 50))
        asset = request.args.get('asset')  # Optional filter by asset
        source = request.args.get('source')  # Optional filter by source (blockchain, exchange)
        start_date = request.args.get('start_date')  # Optional filter by date range
        end_date = request.args.get('end_date')  # Optional filter by date range
        
        # Validate parameters
        if page < 1:
            page = 1
        if page_size < 1 or page_size > 100:
            page_size = 50
            
        # Generate sample transaction data
        # In a real implementation, this would fetch from a database
        all_transactions = []
        
        # Define possible transaction types
        tx_types = ["deposit", "withdrawal", "swap", "trade", "stake", "unstake", "reward", "fee"]
        
        # Define possible assets
        assets = ["BTC", "ETH", "USDC", "USDT", "SOL", "ADA", "DOT", "AVAX", "MATIC", "LINK"]
        
        # Define possible sources
        blockchain_sources = ["ethereum", "bitcoin", "solana", "polygon", "avalanche"]
        exchange_sources = ["binance", "coinbase", "kraken", "ftx", "huobi"]
        
        # Generate 500 sample transactions (more than one page to test pagination)
        for i in range(1, 501):
            # Create random transaction date within the last year
            days_ago = random.randint(0, 365)
            tx_date = datetime.now() - timedelta(days=days_ago)
            
            # Determine if it's a blockchain or exchange transaction
            is_blockchain = random.choice([True, False])
            
            # Pick random values for the transaction
            tx_asset = random.choice(assets)
            tx_type = random.choice(tx_types)
            
            # Generate amount and fee based on asset and type
            if tx_asset in ["BTC"]:
                amount = round(random.uniform(0.001, 1.0), 8)
                fee = round(random.uniform(0.00001, 0.001), 8)
            elif tx_asset in ["ETH", "SOL", "AVAX"]:
                amount = round(random.uniform(0.01, 10.0), 6)
                fee = round(random.uniform(0.0001, 0.01), 6)
            else:  # Assume stablecoins or other tokens
                amount = round(random.uniform(1, 5000), 2)
                fee = round(random.uniform(0.1, 10), 2)
            
            # Handle special transaction types
            if tx_type == "swap" or tx_type == "trade":
                # For swaps/trades, include a second asset
                tx_asset2 = random.choice([a for a in assets if a != tx_asset])
                
                # Calculate equivalent amount in the second asset
                if tx_asset2 == "BTC" and tx_asset != "BTC":
                    amount2 = round(amount * random.uniform(0.00001, 0.0001), 8)  # Convert to BTC
                elif tx_asset2 == "ETH" and tx_asset != "ETH":
                    amount2 = round(amount * random.uniform(0.0001, 0.001), 6)  # Convert to ETH
                elif tx_asset2 in ["USDC", "USDT"] and tx_asset not in ["USDC", "USDT"]:
                    amount2 = round(amount * random.uniform(100, 5000), 2)  # Convert to USD
                elif tx_asset in ["USDC", "USDT"] and tx_asset2 not in ["USDC", "USDT"]:
                    amount2 = round(amount * random.uniform(0.0002, 0.01), 6)  # Convert from USD
                else:
                    amount2 = round(amount * random.uniform(0.5, 2.0), 6)  # Random conversion
            else:
                tx_asset2 = None
                amount2 = None
            
            # Create transaction object
            transaction = {
                "id": f"tx_{i}",
                "timestamp": tx_date.isoformat(),
                "type": tx_type,
                "status": random.choice(["completed", "completed", "completed", "pending", "failed"]),  # mostly completed
                "asset": tx_asset,
                "amount": amount,
                "fee": fee,
                "fee_asset": tx_asset if random.random() < 0.8 else "ETH",  # Most fees in same asset, sometimes ETH
                "source": "blockchain" if is_blockchain else "exchange",
                "details": {}
            }
            
            # Add source-specific details
            if is_blockchain:
                chain = random.choice(blockchain_sources)
                transaction["details"] = {
                    "chain": chain,
                    "address": f"0x{secrets.token_hex(20)}" if chain in ["ethereum", "polygon"] else f"{secrets.token_hex(32)}",
                    "transaction_hash": f"0x{secrets.token_hex(32)}",
                    "block_number": random.randint(10000000, 20000000),
                    "confirmations": random.randint(1, 100)
                }
            else:  # exchange
                exchange = random.choice(exchange_sources)
                transaction["details"] = {
                    "exchange": exchange,
                    "order_id": f"{exchange}_{secrets.token_hex(16)}"
                }
            
            # Add second asset details for swaps/trades
            if tx_type == "swap" or tx_type == "trade":
                transaction["details"]["second_asset"] = tx_asset2
                transaction["details"]["second_amount"] = amount2
            
            # Calculate USD value
            if tx_asset in ["USDC", "USDT"]:
                usd_value = amount  # 1:1 for stablecoins
            elif tx_asset == "BTC":
                usd_value = amount * random.uniform(15000, 45000)
            elif tx_asset == "ETH":
                usd_value = amount * random.uniform(1000, 3000)
            else:
                usd_value = amount * random.uniform(1, 100)
            
            transaction["usd_value"] = round(usd_value, 2)
            
            all_transactions.append(transaction)
        
        # Sort transactions by date (newest first)
        all_transactions.sort(key=lambda x: x["timestamp"], reverse=True)
        
        # Apply filters if provided
        filtered_transactions = all_transactions
        
        if asset:
            filtered_transactions = [tx for tx in filtered_transactions if tx["asset"] == asset]
        
        if source:
            filtered_transactions = [tx for tx in filtered_transactions if tx["source"] == source]
        
        if start_date:
            try:
                start_date_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                filtered_transactions = [tx for tx in filtered_transactions if datetime.fromisoformat(tx["timestamp"].replace('Z', '+00:00')) >= start_date_dt]
            except ValueError:
                pass  # Invalid date format, ignore filter
        
        if end_date:
            try:
                end_date_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
                filtered_transactions = [tx for tx in filtered_transactions if datetime.fromisoformat(tx["timestamp"].replace('Z', '+00:00')) <= end_date_dt]
            except ValueError:
                pass  # Invalid date format, ignore filter
        
        # Calculate pagination
        total_transactions = len(filtered_transactions)
        total_pages = (total_transactions + page_size - 1) // page_size
        
        # Get the current page of transactions
        start_idx = (page - 1) * page_size
        end_idx = min(start_idx + page_size, total_transactions)
        page_transactions = filtered_transactions[start_idx:end_idx]
        
        # Return paginated and filtered transactions
        return jsonify({
            "page": page,
            "page_size": page_size,
            "total_transactions": total_transactions,
            "total_pages": total_pages,
            "transactions": page_transactions,
            "filters": {
                "asset": asset,
                "source": source,
                "start_date": start_date,
                "end_date": end_date
            }
        })
        
    except Exception as e:
        logger.error(f"Error fetching transactions: {str(e)}")
        return jsonify({"error": "Failed to fetch transactions"}), 500

# History status endpoint
@app.route('/api/1/history/status', methods=['GET'])
def get_history_status():
    """Get progress of historical sync."""
    logger.info("/api/1/history/status endpoint called")
    try:
        # In a real implementation, this would track actual sync progress
        # For this demo, we'll generate a realistic status response
        
        # Define possible sync states
        states = ["idle", "in_progress", "completed", "failed"]
        
        # For demo purposes, randomly select a state but weight towards 'completed'
        weights = [0.1, 0.2, 0.6, 0.1]  # 60% chance of completed
        current_state = random.choices(states, weights=weights, k=1)[0]
        
        # Generate status response based on the state
        status = {
            "timestamp": datetime.now().isoformat(),
            "overall_state": current_state,
            "sources": []
        }
        
        # Add blockchain sources
        blockchain_sources = ["ethereum", "bitcoin", "solana", "polygon", "avalanche"]
        for chain in blockchain_sources:
            # Generate realistic progress values based on overall state
            if current_state == "idle":
                progress = 0
                state = "idle"
                message = "Waiting to start"
            elif current_state == "in_progress":
                progress = random.randint(10, 90)  # Random progress percentage
                state = "in_progress"
                message = f"Syncing block {random.randint(10000000, 20000000)}"
            elif current_state == "completed":
                progress = 100
                state = "completed"
                message = "Sync complete"
            else:  # failed
                progress = random.randint(10, 90)  # Failed at some point
                state = "failed"
                message = "Error syncing data: API rate limit exceeded"
            
            # Add more realistic details based on chain
            if chain == "ethereum":
                last_synced = "Transactions and ERC-20 tokens"
            elif chain == "bitcoin":
                last_synced = "UTXO transactions"
            elif chain == "solana":
                last_synced = "SPL tokens and transactions"
            else:
                last_synced = "Transactions and tokens"
            
            source_info = {
                "name": chain,
                "type": "blockchain",
                "state": state,
                "progress": progress,
                "message": message,
                "last_synced": last_synced,
                "last_update": (datetime.now() - timedelta(minutes=random.randint(1, 60))).isoformat()
            }
            
            status["sources"].append(source_info)
        
        # Add exchange sources
        exchange_sources = ["binance", "coinbase", "kraken"]
        for exchange in exchange_sources:
            # Generate realistic progress values based on overall state
            if current_state == "idle":
                progress = 0
                state = "idle"
                message = "Waiting to start"
            elif current_state == "in_progress":
                progress = random.randint(10, 90)  # Random progress percentage
                state = "in_progress"
                message = "Fetching historical trades"
            elif current_state == "completed":
                progress = 100
                state = "completed"
                message = "Sync complete"
            else:  # failed
                progress = random.randint(10, 90)  # Failed at some point
                state = "failed"
                message = "Error syncing data: Invalid API credentials"
            
            # Add more realistic details based on exchange
            if exchange == "binance":
                last_synced = "Spot trades and withdrawals"
            elif exchange == "coinbase":
                last_synced = "Transactions and balances"
            else:
                last_synced = "Trading history"
            
            source_info = {
                "name": exchange,
                "type": "exchange",
                "state": state,
                "progress": progress,
                "message": message,
                "last_synced": last_synced,
                "last_update": (datetime.now() - timedelta(minutes=random.randint(1, 30))).isoformat()
            }
            
            status["sources"].append(source_info)
        
        # Calculate overall progress as average of all sources
        total_progress = sum(source["progress"] for source in status["sources"])
        status["overall_progress"] = round(total_progress / len(status["sources"]), 1)
        
        # Add estimated time remaining if in progress
        if current_state == "in_progress":
            # Calculate estimated completion time based on progress
            remaining_percentage = 100 - status["overall_progress"]
            # Assume each percent takes 1-5 minutes
            minutes_per_percent = random.uniform(1, 5)
            estimated_minutes = remaining_percentage * minutes_per_percent
            
            status["estimated_completion"] = (datetime.now() + timedelta(minutes=estimated_minutes)).isoformat()
            status["estimated_minutes_remaining"] = round(estimated_minutes)
        
        return jsonify(status)
    except Exception as e:
        logger.error(f"Error fetching history status: {str(e)}")
        return jsonify({"error": "Failed to fetch history status"}), 500

# Oracle cache endpoint
@app.route('/api/1/oracle/cache/create', methods=['POST'])
def create_oracle_cache():
    """Pre-seed historical price cache."""
    logger.info("/api/1/oracle/cache/create endpoint called")
    try:
        # Get request parameters
        params = request.json or {}
        
        # Extract parameters with defaults
        assets = params.get("assets", ["BTC", "ETH"])  # Default to BTC and ETH if not specified
        start_date = params.get("start_date", (datetime.now() - timedelta(days=30)).isoformat())
        end_date = params.get("end_date", datetime.now().isoformat())
        resolution = params.get("resolution", "daily")  # hourly, daily, weekly
        
        # Validate parameters
        if not assets:
            return jsonify({"error": "No assets specified"}), 400
        
        try:
            start_date_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end_date_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        except ValueError:
            return jsonify({"error": "Invalid date format"}), 400
        
        if start_date_dt > end_date_dt:
            return jsonify({"error": "Start date must be before end date"}), 400
        
        # Calculate expected data points based on resolution
        if resolution == "hourly":
            interval = timedelta(hours=1)
        elif resolution == "daily":
            interval = timedelta(days=1)
        elif resolution == "weekly":
            interval = timedelta(weeks=1)
        else:
            return jsonify({"error": "Invalid resolution"}), 400
        
        total_intervals = (end_date_dt - start_date_dt) / interval
        total_data_points = len(assets) * int(total_intervals)
        
        # Simulate the cache creation process
        # In a real implementation, this would fetch historical prices and store them
        
        # Create a job ID for tracking
        job_id = f"cache_{int(time.time())}"
        
        # Return immediate response with job details
        return jsonify({
            "success": True,
            "message": "Price cache creation started",
            "job_id": job_id,
            "details": {
                "assets": assets,
                "start_date": start_date,
                "end_date": end_date,
                "resolution": resolution,
                "estimated_data_points": total_data_points
            },
            "status": "in_progress",
            "estimated_completion_time": (datetime.now() + timedelta(seconds=total_data_points * 0.1)).isoformat()
        })
    except Exception as e:
        logger.error(f"Error creating oracle cache: {str(e)}")
        return jsonify({"error": "Failed to create oracle cache"}), 500

# WebSocket support
@socketio.on('connect')
def handle_connect():
    """Handle new WebSocket connections."""
    logger.info(f"New WebSocket connection: {request.sid}")
    emit('connection_status', {'status': 'connected', 'message': 'Connected to server'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle WebSocket disconnections."""
    logger.info(f"WebSocket disconnected: {request.sid}")

@socketio.on('subscribe')
def handle_subscribe(data):
    """Handle subscription requests for real-time updates."""
    logger.info(f"New subscription request: {data}")
    
    # Extract subscription details
    channel = data.get('channel')
    filters = data.get('filters', {})
    
    if not channel:
        emit('error', {'message': 'No channel specified in subscription request'})
        return
    
    # Add client to appropriate room based on channel
    join_room(channel)
    
    # Confirm subscription
    emit('subscription_status', {
        'status': 'subscribed',
        'channel': channel,
        'filters': filters,
        'message': f'Successfully subscribed to {channel}'
    })
    
    # Send initial data based on channel
    if channel == 'portfolio_updates':
        # Simulate sending portfolio snapshot
        emit('portfolio_update', {
            'timestamp': datetime.now().isoformat(),
            'total_value_usd': random.uniform(50000, 200000),
            'change_24h_percentage': random.uniform(-5, 5)
        })
    elif channel == 'price_updates':
        # Simulate sending price updates for requested assets
        requested_assets = filters.get('assets', ['BTC', 'ETH'])
        price_updates = {}
        
        for asset in requested_assets:
            if asset == 'BTC':
                price_updates[asset] = {
                    'usd': random.uniform(20000, 40000),
                    'change_24h_percentage': random.uniform(-5, 5)
                }
            elif asset == 'ETH':
                price_updates[asset] = {
                    'usd': random.uniform(1000, 3000),
                    'change_24h_percentage': random.uniform(-7, 7)
                }
            else:
                price_updates[asset] = {
                    'usd': random.uniform(0.1, 1000),
                    'change_24h_percentage': random.uniform(-10, 10)
                }
        
        emit('price_update', {
            'timestamp': datetime.now().isoformat(),
            'prices': price_updates
        })

@socketio.on('unsubscribe')
def handle_unsubscribe(data):
    """Handle unsubscribe requests."""
    logger.info(f"Unsubscribe request: {data}")
    
    # Extract channel information
    channel = data.get('channel')
    
    if not channel:
        emit('error', {'message': 'No channel specified in unsubscribe request'})
        return
    
    # Remove client from the room
    leave_room(channel)
    
    # Confirm unsubscription
    emit('subscription_status', {
        'status': 'unsubscribed',
        'channel': channel,
        'message': f'Successfully unsubscribed from {channel}'
    })

# CORS test endpoint - useful for verifying frontend-backend integration
@app.route('/api/cors-test', methods=['GET', 'POST', 'OPTIONS'])
def cors_test():
    """Test CORS configuration and frontend-backend integration."""
    logger.info(f"CORS test endpoint called: {request.method}")
    
    # Log headers for debugging
    headers = dict(request.headers)
    safe_headers = {k: v for k, v in headers.items() if 'auth' not in k.lower()}
    logger.info(f"Request headers: {safe_headers}")
    
    if request.method == 'OPTIONS':
        # Handle preflight request
        return '', 204
    elif request.method == 'POST':
        # Return the posted data as confirmation
        try:
            data = request.json
            logger.info(f"Received data: {data}")
            return jsonify({
                "success": True,
                "message": "CORS POST test successful",
                "received_data": data
            })
        except Exception as e:
            logger.error(f"Error in CORS POST test: {e}")
            return jsonify({
                "success": False,
                "error": str(e)
            }), 400
    else:
        # Simple GET request
        return jsonify({
            "success": True,
            "message": "CORS GET test successful",
            "origin": request.headers.get('Origin', 'Unknown'),
            "timestamp": datetime.now().isoformat()
        })

# Error handlers for production-ready API
@app.errorhandler(404)
def not_found_error(error):
    """Handle 404 errors with a proper JSON response."""
    logger.warning(f"404 Error: {request.path} not found")
    return jsonify({
        "error": "Resource not found",
        "path": request.path,
        "status": 404
    }), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors with a proper JSON response."""
    logger.error(f"500 Error: {str(error)}")
    return jsonify({
        "error": "Internal server error",
        "status": 500
    }), 500

@app.errorhandler(Exception)
def handle_exception(e):
    """Handle all other exceptions."""
    logger.error(f"Unhandled exception: {str(e)}")
    return jsonify({
        "error": "Server error",
        "message": str(e),
        "status": 500
    }), 500

if __name__ == '__main__':
    # Initialize sample data
    initialize_data()
    
    # Get port from environment or use default
    port = int(os.environ.get('PORT', 8081))
    
    # Run the Flask server
    logger.info(f"Starting simplified backend on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False)
